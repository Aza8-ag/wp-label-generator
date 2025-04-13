let etiquetas = JSON.parse(localStorage.getItem('etiquetas')) || [];
let indiceEdicao = -1;
let confirmCallback = null;

// Lista de mensagens que usam notificação flutuante
const toastMessages = [
    'Etiqueta criada com sucesso!',
    'Etiqueta excluída com sucesso!',
    'Etiqueta editada com sucesso!',
    'Todas as etiquetas foram limpas!',
    'Não há etiquetas para limpar!',
    'Etiquetas exportadas com sucesso!'
];

// Função para exibir notificações flutuantes
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const notification = document.createElement('div');
    notification.className = `toast-notification ${type}`;
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-btn" aria-label="Fechar notificação">×</button>
    `;
    container.appendChild(notification);

    notification.querySelector('.close-btn').addEventListener('click', () => {
        notification.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => notification.remove(), 300);
    });

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Função para exibir notificações como lightbox
function showNotification(message, type = 'info', callback = null) {
    if (toastMessages.includes(message) || message.includes('Foram adicionadas')) {
        showToast(message, type);
        return;
    }

    const lightbox = document.getElementById('confirmLightbox');
    const content = lightbox.querySelector('.notification-content');
    const messageElement = lightbox.querySelector('.notification-message');
    const actions = lightbox.querySelector('.notification-actions');

    content.className = 'notification-content';
    content.classList.add(type);
    messageElement.textContent = message;

    actions.innerHTML = '';
    if (type === 'confirm') {
        actions.innerHTML = `
            <button onclick="confirmNotification(true)">Sim</button>
            <button class="cancel" onclick="confirmNotification(false)">Não</button>
        `;
        confirmCallback = callback;
    } else {
        actions.innerHTML = `<button onclick="closeNotification()">Fechar</button>`;
    }

    lightbox.style.display = 'flex';
}

// Função para fechar notificação lightbox
function closeNotification() {
    const lightbox = document.getElementById('confirmLightbox');
    lightbox.style.display = 'none';
    confirmCallback = null;
}

// Função para lidar com confirmações
function confirmNotification(result) {
    const callback = confirmCallback;
    closeNotification();
    if (callback) {
        callback(result);
    }
}

// Função para validar EAN-13
function validarEAN13(ean) {
    if (!ean || ean.length !== 13 || !/^\d{13}$/.test(ean)) {
        return { valid: false, error: 'EAN-13 deve ter exatamente 13 dígitos numéricos.' };
    }
    const digits = ean.split('').map(Number);
    const checkDigit = digits.pop();
    const sum = digits.reduce((acc, digit, index) => {
        return acc + (index % 2 === 0 ? digit : digit * 3);
    }, 0);
    const calculatedCheckDigit = (10 - (sum % 10)) % 10;
    if (calculatedCheckDigit !== checkDigit) {
        return { valid: false, error: 'Dígito verificador do EAN-13 inválido.' };
    }
    return { valid: true };
}

// Função para verificar duplicatas de EAN-13
function verificarDuplicatasEAN(codigosBarras) {
    const eans = codigosBarras.map(item => item.ean).filter(ean => ean);
    const duplicates = eans.filter((item, index) => eans.indexOf(item) !== index);
    if (duplicates.length > 0) {
        return { valid: false, error: `EAN-13 duplicado encontrado: ${duplicates.join(', ')}` };
    }
    return { valid: true };
}

// Função para abreviar nomes longos
function abreviarNome(nome) {
    const limite = 15;
    if (nome.length > limite) {
        return nome.substring(0, limite - 3) + '...';
    }
    return nome;
}

function adicionarEtiquetaIndividual(event) {
    if (event) event.preventDefault();
    const nonce = document.getElementById('label-generator-nonce')?.dataset.nonce;
    if (!nonce || !wp_verify_nonce(nonce, 'label_generator_nonce')) {
        showNotification('Falha na verificação de segurança.', 'error');
        return;
    }

    const nome = document.getElementById('nome').value || "Sem Nome";
    const quantidade = document.getElementById('quantidade').value || "1 Pç.";
    const peso = document.getElementById('peso').value || "12kg";
    const prodComp = document.getElementById('prodComp').value || "0";
    const prodLarg = document.getElementById('prodLarg').value || "0";
    const prodAlt = document.getElementById('prodAlt').value || "0";
    const embComp = document.getElementById('embComp').value || "0";
    const embLarg = document.getElementById('embLarg').value || "0";
    const embAlt = document.getElementById('embAlt').value || "0";
    const validade = document.getElementById('validade').value || "Indeterminada";
    const idade = document.getElementById('idade').value || "3 anos ou mais";
    const lote = document.getElementById('lote').value || "";
    const fotoInput = document.getElementById('foto');
    const foto = fotoInput.files[0] ? URL.createObjectURL(fotoInput.files[0]) : null;

    const codigosBarras = [];
    document.querySelectorAll('#codigosBarras .codigo-barra-item').forEach(item => {
        const ref = item.querySelector('.ref').value;
        const cor = item.querySelector('.cor').value;
        const ean = item.querySelector('.ean').value;
        if (ref || cor || ean) {
            codigosBarras.push({ ref, cor, ean });
        }
    });

    const duplicataCheck = verificarDuplicatasEAN(codigosBarras);
    if (!duplicataCheck.valid) {
        showNotification(duplicataCheck.error, 'error');
        return;
    }

    for (const codigo of codigosBarras) {
        if (codigo.ean) {
            const validacao = validarEAN13(codigo.ean);
            if (!validacao.valid) {
                showNotification(validacao.error, 'error');
                return;
            }
        }
    }

    etiquetas.push({
        nome, quantidade, peso,
        dimensoesProduto: { comprimento: prodComp, largura: prodLarg, altura: prodAlt },
        dimensoesEmbalagem: { comprimento: embComp, largura: embLarg, altura: embAlt },
        validade, idade, lote, foto, codigosBarras
    });
    atualizarLista();
    limparCamposIndividual();
    showNotification('Etiqueta criada com sucesso!', 'success');
}

function limparCamposIndividual() {
    document.getElementById('nome').value = '';
    document.getElementById('quantidade').value = '';
    document.getElementById('peso').value = '';
    document.getElementById('prodComp').value = '';
    document.getElementById('prodLarg').value = '';
    document.getElementById('prodAlt').value = '';
    document.getElementById('embComp').value = '';
    document.getElementById('embLarg').value = '';
    document.getElementById('embAlt').value = '';
    document.getElementById('validade').value = '';
    document.getElementById('idade').value = '';
    document.getElementById('lote').value = '';
    document.getElementById('foto').value = '';
    const codigosContainer = document.getElementById('codigosBarras');
    codigosContainer.innerHTML = `
        <label>Códigos de Barras:</label>
        <div class="codigo-barra-item">
            <input type="text" class="ref" placeholder="Ref">
            <input type="text" class="cor" placeholder="Cor">
            <input type="text" class="ean" placeholder="EAN 13">
        </div>
        <button type="button" onclick="adicionarCodigoBarra()">Adicionar Código</button>
    `;
}

function adicionarCodigoBarra(event) {
    if (event) event.preventDefault();
    const container = document.getElementById('codigosBarras');
    const itens = container.querySelectorAll('.codigo-barra-item');
    if (itens.length < 6) {
        const novoItem = document.createElement('div');
        novoItem.className = 'codigo-barra-item';
        novoItem.innerHTML = `
            <input type="text" class="ref" placeholder="Ref">
            <input type="text" class="cor" placeholder="Cor">
            <input type="text" class="ean" placeholder="EAN 13">
            <button type="button" onclick="removerCodigoBarra(this)">Remover</button>
        `;
        container.insertBefore(novoItem, container.lastElementChild);
    } else {
        showNotification('Limite de 6 códigos de barras atingido!', 'warning');
    }
}

function removerCodigoBarra(botao) {
    botao.parentElement.remove();
}

function adicionarCodigoBarraEdicao(event) {
    if (event) event.preventDefault();
    const container = document.getElementById('editCodigosBarras');
    const itens = container.querySelectorAll('.codigo-barra-item');
    if (itens.length < 6) {
        const novoItem = document.createElement('div');
        novoItem.className = 'codigo-barra-item';
        novoItem.innerHTML = `
            <input type="text" class="ref" placeholder="Ref">
            <input type="text" class="cor" placeholder="Cor">
            <input type="text" class="ean" placeholder="EAN 13">
            <button type="button" onclick="removerCodigoBarra(this)">Remover</button>
        `;
        container.appendChild(novoItem);
    } else {
        showNotification('Limite de 6 códigos de barras atingido!', 'warning');
    }
}

function mostrarJsonLightbox() {
    document.getElementById('jsonLightbox').style.display = 'flex';
    document.getElementById('excelInput').value = '';
}

function fecharJsonLightbox() {
    document.getElementById('jsonLightbox').style.display = 'none';
}

function adicionarEtiquetasLote(event) {
    if (event) event.preventDefault();
    const nonce = document.getElementById('label-generator-nonce')?.dataset.nonce;
    if (!nonce || !wp_verify_nonce(nonce, 'label_generator_nonce')) {
        showNotification('Falha na verificação de segurança.', 'error');
        return;
    }

    const excelInput = document.getElementById('excelInput');
    const file = excelInput.files[0];
    if (!file) {
        showNotification('Por favor, selecione um arquivo Excel (.xlsx ou .xls)!', 'error');
        return;
    }

    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
        showNotification('Formato inválido! Use um arquivo .xlsx ou .xls.', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            if (!workbook.SheetNames.length) {
                throw new Error('O arquivo Excel está vazio ou corrompido.');
            }

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (!jsonData.length) {
                throw new Error('A planilha está vazia.');
            }

            const expectedHeaders = [
                'Nome do Produto', 'Quantidade', 'Peso Bruto',
                'Dimensões Produto Comprimento (cm)', 'Dimensões Produto Largura (cm)', 'Dimensões Produto Altura (cm)',
                'Dimensões Embalagem Comprimento (cm)', 'Dimensões Embalagem Largura (cm)', 'Dimensões Embalagem Altura (cm)',
                'Validade', 'Idade Indicada', 'Lote de Produção',
                'Código Barra 1 Ref', 'Código Barra 1 Cor', 'Código Barra 1 EAN',
                'Código Barra 2 Ref', 'Código Barra 2 Cor', 'Código Barra 2 EAN',
                'Código Barra 3 Ref', 'Código Barra 3 Cor', 'Código Barra 3 EAN',
                'Código Barra 4 Ref', 'Código Barra 4 Cor', 'Código Barra 4 EAN',
                'Código Barra 5 Ref', 'Código Barra 5 Cor', 'Código Barra 5 EAN',
                'Código Barra 6 Ref', 'Código Barra 6 Cor', 'Código Barra 6 EAN'
            ];
            const headers = jsonData[0];
            if (!headers || !expectedHeaders.every((h, i) => !headers[i] || headers[i] === h)) {
                throw new Error('Os cabeçalhos do Excel não correspondem ao modelo esperado. Baixe o modelo para referência.');
            }

            const novasEtiquetas = jsonData.slice(1).map((row, rowIndex) => {
                if (!row || row.every(cell => !cell)) {
                    return null;
                }

                const codigosBarras = [];
                for (let i = 1; i <= 6; i++) {
                    const ref = row[12 + (i-1)*3];
                    const cor = row[13 + (i-1)*3];
                    const ean = row[14 + (i-1)*3];
                    if (ref || cor || ean) {
                        codigosBarras.push({
                            ref: ref ? String(ref) : '',
                            cor: cor ? String(cor) : '',
                            ean: ean ? String(ean) : ''
                        });
                    }
                }

                const duplicataCheck = verificarDuplicatasEAN(codigosBarras);
                if (!duplicataCheck.valid) {
                    showNotification(duplicataCheck.error, 'error');
                    return null;
                }

                for (const codigo of codigosBarras) {
                    if (codigo.ean) {
                        const validacao = validarEAN13(codigo.ean);
                        if (!validacao.valid) {
                            showNotification(`Linha ${rowIndex + 2}: ${validacao.error}`, 'warning');
                            return null;
                        }
                    }
                }

                return {
                    nome: row[0] ? String(row[0]) : 'Sem Nome',
                    quantidade: row[1] ? String(row[1]) : '1 Pç.',
                    peso: row[2] ? String(row[2]) : '12kg',
                    dimensoesProduto: {
                        comprimento: row[3] ? String(row[3]) : '0',
                        largura: row[4] ? String(row[4]) : '0',
                        altura: row[5] ? String(row[5]) : '0'
                    },
                    dimensoesEmbalagem: {
                        comprimento: row[6] ? String(row[6]) : '0',
                        largura: row[7] ? String(row[7]) : '0',
                        altura: row[8] ? String(row[8]) : '0'
                    },
                    validade: row[9] ? String(row[9]) : 'Indeterminada',
                    idade: row[10] ? String(row[10]) : '3 anos ou mais',
                    lote: row[11] ? String(row[11]) : '',
                    foto: null,
                    codigosBarras
                };
            }).filter(item => item);

            if (!novasEtiquetas.length) {
                throw new Error('Nenhuma etiqueta válida encontrada no arquivo.');
            }

            etiquetas = etiquetas.concat(novasEtiquetas);
            atualizarLista();
            fecharJsonLightbox();
            showNotification(`Foram adicionadas ${novasEtiquetas.length} etiquetas com sucesso!`, 'success');
        } catch (error) {
            console.error('Erro ao processar o Excel:', error);
            showNotification(`Erro ao carregar o arquivo: ${error.message}`, 'error');
        }
    };
    reader.onerror = function() {
        showNotification('Erro ao ler o arquivo Excel. Verifique se o arquivo não está corrompido.', 'error');
    };
    reader.readAsArrayBuffer(file);
}

function atualizarLista() {
    const container = document.getElementById('etiquetas');
    container.innerHTML = '';
    etiquetas.forEach((etiqueta, index) => {
        const div = document.createElement('div');
        div.className = 'etiqueta-item';

        // Primeira linha: Nome (limitado a 10 caracteres) - Ref e flag
        const primeiraLinha = document.createElement('div');
        primeiraLinha.className = 'primeira-linha';

        const nomeContainer = document.createElement('div');
        nomeContainer.className = 'nome-container';
        const ref = etiqueta.codigosBarras.length > 0 ? etiqueta.codigosBarras[0].ref : 'N/A';
        const nomeSpan = document.createElement('span');
        nomeSpan.className = 'nome';
        nomeSpan.textContent = `${abreviarNome(etiqueta.nome)} - Ref: ${ref}`;
        nomeContainer.appendChild(nomeSpan);
        primeiraLinha.appendChild(nomeContainer);

        const flag = document.createElement('span');
        flag.className = 'flag';
        flag.classList.add(etiqueta.foto ? 'com-imagem' : 'sem-imagem');
        flag.textContent = etiqueta.foto ? 'Com Imagem' : 'Sem Imagem';
        primeiraLinha.appendChild(flag);

        div.appendChild(primeiraLinha);

        // Segunda linha: Botões (Editar, Visualizar, Excluir, Gerar PDF)
        const segundaLinha = document.createElement('div');
        segundaLinha.className = 'segunda-linha';

        const btnEditar = document.createElement('button');
        btnEditar.className = 'editar';
        btnEditar.textContent = 'Editar';
        btnEditar.onclick = () => editarEtiqueta(index);
        segundaLinha.appendChild(btnEditar);

        const btnVisualizar = document.createElement('button');
        btnVisualizar.className = 'visualizar';
        btnVisualizar.textContent = 'Visualizar';
        btnVisualizar.onclick = () => visualizarEtiqueta(index);
        segundaLinha.appendChild(btnVisualizar);

        const btnExcluir = document.createElement('button');
        btnExcluir.className = 'excluir';
        btnExcluir.textContent = 'Excluir';
        btnExcluir.onclick = () => excluirEtiqueta(index);
        segundaLinha.appendChild(btnExcluir);

        const btnGerarPDF = document.createElement('button');
        btnGerarPDF.className = 'gerar-pdf';
        btnGerarPDF.textContent = 'Gerar PDF';
        btnGerarPDF.onclick = () => gerarPDFIndividual(index);
        segundaLinha.appendChild(btnGerarPDF);

        div.appendChild(segundaLinha);

        container.appendChild(div);
    });
    document.getElementById('contagem').textContent = `Total de etiquetas: ${etiquetas.length}`;
    localStorage.setItem('etiquetas', JSON.stringify(etiquetas));
}

function atualizarImagem(index, file) {
    if (file) {
        etiquetas[index].foto = URL.createObjectURL(file);
        atualizarLista();
    }
}

function excluirEtiqueta(index) {
    etiquetas.splice(index, 1);
    atualizarLista();
    showNotification('Etiqueta excluída com sucesso!', 'success');
}

function editarEtiqueta(index) {
    const etiqueta = etiquetas[index];
    document.getElementById('editNome').value = etiqueta.nome;
    document.getElementById('editQuantidade').value = etiqueta.quantidade;
    document.getElementById('editPeso').value = etiqueta.peso;
    document.getElementById('editProdComp').value = etiqueta.dimensoesProduto.comprimento;
    document.getElementById('editProdLarg').value = etiqueta.dimensoesProduto.largura;
    document.getElementById('editProdAlt').value = etiqueta.dimensoesProduto.altura;
    document.getElementById('editEmbComp').value = etiqueta.dimensoesEmbalagem.comprimento;
    document.getElementById('editEmbLarg').value = etiqueta.dimensoesEmbalagem.largura;
    document.getElementById('editEmbAlt').value = etiqueta.dimensoesEmbalagem.altura;
    document.getElementById('editValidade').value = etiqueta.validade;
    document.getElementById('editIdade').value = etiqueta.idade;
    document.getElementById('editLote').value = etiqueta.lote;
    document.getElementById('editFoto').value = '';

    const codigosContainer = document.getElementById('editCodigosBarras');
    codigosContainer.innerHTML = '<label>Códigos de Barras:</label>';
    etiqueta.codigosBarras.forEach(codigo => {
        const div = document.createElement('div');
        div.className = 'codigo-barra-item';
        div.innerHTML = `
            <input type="text" class="ref" value="${codigo.ref}">
            <input type="text" class="cor" value="${codigo.cor}">
            <input type="text" class="ean" value="${codigo.ean}">
            <button type="button" onclick="removerCodigoBarra(this)">Remover</button>
        `;
        codigosContainer.appendChild(div);
    });

    document.getElementById('editLightbox').style.display = 'flex';
    indiceEdicao = index;
}

function salvarEdicao(event) {
    if (event) event.preventDefault();
    const nonce = document.getElementById('label-generator-nonce')?.dataset.nonce;
    if (!nonce || !wp_verify_nonce(nonce, 'label_generator_nonce')) {
        showNotification('Falha na verificação de segurança.', 'error');
        return;
    }

    const nome = document.getElementById('editNome').value || "Sem Nome";
    const quantidade = document.getElementById('editQuantidade').value || "1 Pç.";
    const peso = document.getElementById('editPeso').value || "12kg";
    const prodComp = document.getElementById('editProdComp').value || "0";
    const prodLarg = document.getElementById('editProdLarg').value || "0";
    const prodAlt = document.getElementById('editProdAlt').value || "0";
    const embComp = document.getElementById('editEmbComp').value || "0";
    const embLarg = document.getElementById('editEmbLarg').value || "0";
    const embAlt = document.getElementById('editEmbAlt').value || "0";
    const validade = document.getElementById('editValidade').value || "Indeterminada";
    const idade = document.getElementById('editIdade').value || "3 anos ou mais";
    const lote = document.getElementById('editLote').value || "";
    const fotoInput = document.getElementById('editFoto');
    const foto = fotoInput.files[0] ? URL.createObjectURL(fotoInput.files[0]) : etiquetas[indiceEdicao].foto;

    const codigosBarras = [];
    document.querySelectorAll('#editCodigosBarras .codigo-barra-item').forEach(item => {
        const ref = item.querySelector('.ref').value;
        const cor = item.querySelector('.cor').value;
        const ean = item.querySelector('.ean').value;
        if (ref || cor || ean) {
            codigosBarras.push({ ref, cor, ean });
        }
    });

    const duplicataCheck = verificarDuplicatasEAN(codigosBarras);
    if (!duplicataCheck.valid) {
        showNotification(duplicataCheck.error, 'error');
        return;
    }

    for (const codigo of codigosBarras) {
        if (codigo.ean) {
            const validacao = validarEAN13(codigo.ean);
            if (!validacao.valid) {
                showNotification(validacao.error, 'error');
                return;
            }
        }
    }

    etiquetas[indiceEdicao] = {
        nome, quantidade, peso,
        dimensoesProduto: { comprimento: prodComp, largura: prodLarg, altura: prodAlt },
        dimensoesEmbalagem: { comprimento: embComp, largura: embLarg, altura: embAlt },
        validade, idade, lote, foto, codigosBarras
    };
    atualizarLista();
    fecharLightbox();
    showNotification('Etiqueta editada com sucesso!', 'success');
}

function fecharLightbox() {
    document.getElementById('editLightbox').style.display = 'none';
    indiceEdicao = -1;
}

function visualizarEtiqueta(index) {
    const etiqueta = etiquetas[index];
    const codigosBarrasHTML = etiqueta.codigosBarras.map((codigo, i) => `
        <div style="position: absolute; left: 115mm; top: ${30 + i * 20}mm; height: 20mm; font-size: 12pt; font-family: 'Roboto', sans-serif; display: flex; align-items: center;">
            ${validarEAN13(codigo.ean).valid ? `<svg id="barcode${i}" style="margin-right: 5mm; width: 40mm; height: 12mm;"></svg><script>JsBarcode("#barcode${i}", "${codigo.ean}", { format: "EAN13", height: 48, width: 2, displayValue: true, fontSize: 14, margin: 0 });</script>` : `<span style="margin-right: 5mm;">EAN inválido</span>`}
            <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
                <div style="font-weight: 700;">REF: ${codigo.ref.toUpperCase()}</div>
                <div style="display: flex; align-items: center; margin-top: 1mm;">
                    <span style="margin-right: 2mm; width: 5mm; height: 5mm; border: 1px solid black;"></span>${codigo.cor}
                </div>
            </div>
        </div>
    `).join('');
    const htmlPreview = `
        <html>
        <head>
            <title>Visualização da Etiqueta</title>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js"></script>
            <style>
                body { font-family: 'Roboto', sans-serif; margin: 0; background-color: #F5F7FA; }
                .etiqueta-preview { width: 297mm; height: 210mm; background: url('${labelGenerator.backgroundImageUrl}') no-repeat center; background-size: cover; position: relative; }
                .bold { font-weight: 700; }
            </style>
        </head>
        <body>
            <div class="etiqueta-preview">
                ${etiqueta.foto ? `<img src="${etiqueta.foto}" style="position: absolute; left: 4.2mm; top: 31.5mm; width: 108mm; height: 73mm;">` : '<div style="position: absolute; left: 4.2mm; top: 31.5mm; width: 108mm; height: 73mm; font-size: 12pt; display: flex; align-items: center; justify-content: center; color: #333333;">Sem Imagem</div>'}
                <div style="position: absolute; left: 69.7mm; top: 11.9mm; font-size: 23pt; text-align: left; font-weight: 700;">${etiqueta.nome}</div>
                <div style="position: absolute; left: 4.2mm; top: 111.5mm; font-size: 11pt; text-align: left;">Quantidade: ${etiqueta.quantidade}</div>
                <div style="position: absolute; left: 4.2mm; top: 116.0mm; font-size: 11pt; text-align: left;">Peso Bruto: ${etiqueta.peso}</div>
                <div style="position: absolute; left: 4.2mm; top: 120.5mm; font-size: 11pt; text-align: left;">Dimensões Produto: ${etiqueta.dimensoesProduto.comprimento}x${etiqueta.dimensoesProduto.largura}x${etiqueta.dimensoesProduto.altura} cm</div>
                <div style="position: absolute; left: 4.2mm; top: 125.0mm; font-size: 11pt; text-align: left;">Dimensões Embalagem: ${etiqueta.dimensoesEmbalagem.comprimento}x${etiqueta.dimensoesEmbalagem.largura}x${etiqueta.dimensoesEmbalagem.altura} cm</div>
                <div style="position: absolute; left: 4.2mm; top: 129.5mm; font-size: 11pt; text-align: left;">Validade: ${etiqueta.validade}</div>
                <div style="position: absolute; right: 185.2mm; top: 104.7mm; font-size: 20pt; text-align: left; font-weight: 700;">${etiqueta.idade}</div>
                <div style="position: absolute; left: 181.2mm; top: 191.6mm; font-size: 12pt; text-align: left;">${etiqueta.lote}</div>
                ${codigosBarrasHTML}
            </div>
        </body>
        </html>
    `;
    const novaAba = window.open('', '_blank');
    if (novaAba) {
        novaAba.document.write(htmlPreview);
        novaAba.document.close();
    } else {
        showNotification('Por favor, permita pop-ups para visualizar a etiqueta.', 'warning');
    }
}

function limparTudo(event) {
    if (event) event.preventDefault();
    if (etiquetas.length === 0) {
        showNotification('Não há etiquetas para limpar!', 'warning');
        return;
    }
    showNotification('Deseja realmente limpar todas as etiquetas?', 'confirm', (result) => {
        if (result) {
            etiquetas = [];
            atualizarLista();
            showNotification('Todas as etiquetas foram limpas!', 'success');
        }
    });
}

function exportarJSON(event) {
    if (event) event.preventDefault();
    if (etiquetas.length === 0) {
        showNotification('Não há etiquetas para exportar!', 'warning');
        return;
    }
    const dataStr = JSON.stringify(etiquetas, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'etiquetas_bangtoys.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Etiquetas exportadas com sucesso!', 'success');
}

function loadImageAsBase64(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = () => reject(new Error('Falha ao carregar a imagem de fundo.'));
        img.src = url + '?v=' + new Date().getTime();
    });
}

function generateBarcodeImage(ean) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, ean, {
            format: 'EAN13',
            height: 48,
            width: 2,
            displayValue: true,
            fontSize: 14,
            margin: 0,
            background: 'transparent',
            lineColor: '#000'
        });
        resolve(canvas.toDataURL('image/png', 1.0));
    });
}

async function gerarPDFIndividual(index) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        showNotification('Biblioteca jsPDF não carregada. Verifique a instalação.', 'error');
        console.error('jsPDF não definido');
        return;
    }

    const { jsPDF } = window.jspdf;
    const etiqueta = etiquetas[index];
    let fundoBase64;
    try {
        fundoBase64 = await loadImageAsBase64(labelGenerator.backgroundImageUrl);
    } catch (e) {
        showNotification('Erro ao carregar a imagem de fundo. Verifique se "fundo_etiqueta.jpg" está presente e acessível.', 'error');
        console.error('Erro:', e);
        return;
    }

    const barcodeImages = await Promise.all(
        etiqueta.codigosBarras.map(async (codigo) => {
            if (validarEAN13(codigo.ean).valid) {
                return await generateBarcodeImage(codigo.ean);
            }
            return null;
        })
    );

    const codigosBarrasHTML = etiqueta.codigosBarras.map((codigo, i) => `
        <div style="position: absolute; left: 115mm; top: ${30 + i * 20}mm; height: 20mm; font-size: 12pt; font-family: 'Roboto', sans-serif; display: flex; align-items: center;">
            ${barcodeImages[i] ? `<img src="${barcodeImages[i]}" style="margin-right: 5mm; width: 40mm; height: 12mm; border: none;">` : `<span style="margin-right: 5mm;">EAN inválido</span>`}
            <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
                <div style="font-weight: 700;">REF: ${codigo.ref.toUpperCase()}</div>
                <div style="display: flex; align-items: center; margin-top: 1mm;">
                    <span style="margin-right: 2mm; width: 5mm; height: 5mm; border: 1px solid black;"></span>${codigo.cor}
                </div>
            </div>
        </div>
    `).join('');

    const htmlContent = `
        <div class="etiqueta-preview" style="width: 297mm; height: 210mm; position: relative; font-family: 'Roboto', sans-serif; background: transparent;">
            ${etiqueta.foto ? `<img src="${etiqueta.foto}" style="position: absolute; left: 4.2mm; top: 31.5mm; width: 108mm; height: 73mm;">` : '<div style="position: absolute; left: 4.2mm; top: 31.5mm; width: 108mm; height: 73mm; font-size: 12pt; display: flex; align-items: center; justify-content: center; color: #333333;">Sem Imagem</div>'}
            <div style="position: absolute; left: 69.7mm; top: 11.9mm; font-size: 23pt; text-align: left; font-weight: 700;">${etiqueta.nome}</div>
            <div style="position: absolute; left: 4.2mm; top: 111.5mm; font-size: 11pt; text-align: left;">Quantidade: ${etiqueta.quantidade}</div>
            <div style="position: absolute; left: 4.2mm; top: 116.0mm; font-size: 11pt; text-align: left;">Peso Bruto: ${etiqueta.peso}</div>
            <div style="position: absolute; left: 4.2mm; top: 120.5mm; font-size: 11pt; text-align: left;">Dimensões Produto: ${etiqueta.dimensoesProduto.comprimento}x${etiqueta.dimensoesProduto.largura}x${etiqueta.dimensoesProduto.altura} cm</div>
            <div style="position: absolute; left: 4.2mm; top: 125.0mm; font-size: 11pt; text-align: left;">Dimensões Embalagem: ${etiqueta.dimensoesEmbalagem.comprimento}x${etiqueta.dimensoesEmbalagem.largura}x${etiqueta.dimensoesEmbalagem.altura} cm</div>
            <div style="position: absolute; left: 4.2mm; top: 129.5mm; font-size: 11pt; text-align: left;">Validade: ${etiqueta.validade}</div>
            <div style="position: absolute; right: 185.2mm; top: 104.7mm; font-size: 20pt; text-align: left; font-weight: 700;">${etiqueta.idade}</div>
            <div style="position: absolute; left: 181.2mm; top: 191.6mm; font-size: 12pt; text-align: left;">${etiqueta.lote}</div>
            ${codigosBarrasHTML}
        </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.background = 'transparent';
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv);

    try {
        const canvas = await html2canvas(tempDiv, {
            scale: 3,
            width: 297 * 3.779527559,
            height: 210 * 3.779527559,
            backgroundColor: null,
            logging: false,
            useCORS: true
        });
        const imgData = canvas.toDataURL('image/png', 0.9);

        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        doc.addImage(fundoBase64, 'JPEG', 0, 0, 297, 210, '', 'FAST');
        doc.addImage(imgData, 'PNG', 0, 0, 297, 210);
        const safeFileName = etiqueta.nome.toUpperCase().replace(/[^A-Z0-9]/g, '_');
        doc.save(`${safeFileName}_LABEL_BANGTOYS.pdf`);
    } catch (e) {
        console.error('Erro ao gerar PDF:', e);
        showNotification('Erro ao gerar o PDF para a etiqueta.', 'error');
    } finally {
        document.body.removeChild(tempDiv);
    }
}

async function gerarPDFs(event) {
    if (event) event.preventDefault();
    if (!window.jspdf || !window.jspdf.jsPDF) {
        showNotification('Biblioteca jsPDF não carregada. Verifique a instalação.', 'error');
        console.error('jsPDF não definido');
        return;
    }

    if (etiquetas.length === 0) {
        showNotification('Não há etiquetas para gerar PDFs!', 'warning');
        return;
    }

    const { jsPDF } = window.jspdf;
    let fundoBase64;
    try {
        fundoBase64 = await loadImageAsBase64(labelGenerator.backgroundImageUrl);
    } catch (e) {
        showNotification('Erro ao carregar a imagem de fundo. Verifique se "fundo_etiqueta.jpg" está presente e acessível.', 'error');
        console.error('Erro:', e);
        return;
    }

    for (let index = 0; index < etiquetas.length; index++) {
        const etiqueta = etiquetas[index];

        const barcodeImages = await Promise.all(
            etiqueta.codigosBarras.map(async (codigo) => {
                if (validarEAN13(codigo.ean).valid) {
                    return await generateBarcodeImage(codigo.ean);
                }
                return null;
            })
        );

        const codigosBarrasHTML = etiqueta.codigosBarras.map((codigo, i) => `
            <div style="position: absolute; left: 115mm; top: ${30 + i * 20}mm; height: 20mm; font-size: 12pt; font-family: 'Roboto', sans-serif; display: flex; align-items: center;">
                ${barcodeImages[i] ? `<img src="${barcodeImages[i]}" style="margin-right: 5mm; width: 40mm; height: 12mm; border: none;">` : `<span style="margin-right: 5mm;">EAN inválido</span>`}
                <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
                    <div style="font-weight: 700;">REF: ${codigo.ref.toUpperCase()}</div>
                    <div style="display: flex; align-items: center; margin-top: 1mm;">
                        <span style="margin-right: 2mm; width: 5mm; height: 5mm; border: 1px solid black;"></span>${codigo.cor}
                    </div>
                </div>
            </div>
        `).join('');

        const htmlContent = `
            <div class="etiqueta-preview" style="width: 297mm; height: 210mm; position: relative; font-family: 'Roboto', sans-serif; background: transparent;">
                ${etiqueta.foto ? `<img src="${etiqueta.foto}" style="position: absolute; left: 4.2mm; top: 31.5mm; width: 108mm; height: 73mm;">` : '<div style="position: absolute; left: 4.2mm; top: 31.5mm; width: 108mm; height: 73mm; font-size: 12pt; display: flex; align-items: center; justify-content: center; color: #333333;">Sem Imagem</div>'}
                <div style="position: absolute; left: 69.7mm; top: 11.9mm; font-size: 23pt; text-align: left; font-weight: 700;">${etiqueta.nome}</div>
                <div style="position: absolute; left: 4.2mm; top: 111.5mm; font-size: 11pt; text-align: left;">Quantidade: ${etiqueta.quantidade}</div>
                <div style="position: absolute; left: 4.2mm; top: 116.0mm; font-size: 11pt; text-align: left;">Peso Bruto: ${etiqueta.peso}</div>
                <div style="position: absolute; left: 4.2mm; top: 120.5mm; font-size: 11pt; text-align: left;">Dimensões Produto: ${etiqueta.dimensoesProduto.comprimento}x${etiqueta.dimensoesProduto.largura}x${etiqueta.dimensoesProduto.altura} cm</div>
                <div style="position: absolute; left: 4.2mm; top: 125.0mm; font-size: 11pt; text-align: left;">Dimensões Embalagem: ${etiqueta.dimensoesEmbalagem.comprimento}x${etiqueta.dimensoesEmbalagem.largura}x${etiqueta.dimensoesEmbalagem.altura} cm</div>
                <div style="position: absolute; left: 4.2mm; top: 129.5mm; font-size: 11pt; text-align: left;">Validade: ${etiqueta.validade}</div>
                <div style="position: absolute; right: 185.2mm; top: 104.7mm; font-size: 20pt; text-align: left; font-weight: 700;">${etiqueta.idade}</div>
                <div style="position: absolute; left: 181.2mm; top: 191.6mm; font-size: 12pt; text-align: left;">${etiqueta.lote}</div>
                ${codigosBarrasHTML}
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.background = 'transparent';
        tempDiv.innerHTML = htmlContent;
        document.body.appendChild(tempDiv);

        try {
            const canvas = await html2canvas(tempDiv, {
                scale: 3,
                width: 297 * 3.779527559,
                height: 210 * 3.779527559,
                backgroundColor: null,
                logging: false,
                useCORS: true
            });
            const imgData = canvas.toDataURL('image/png', 0.9);

            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            doc.addImage(fundoBase64, 'JPEG', 0, 0, 297, 210, '', 'FAST');
            doc.addImage(imgData, 'PNG', 0, 0, 297, 210);
            const safeFileName = etiqueta.nome.toUpperCase().replace(/[^A-Z0-9]/g, '_');
            doc.save(`${safeFileName}_LABEL_BANGTOYS.pdf`);
        } catch (e) {
            console.error('Erro ao gerar PDF:', e);
            showNotification(`Erro ao gerar o PDF para a etiqueta ${index + 1}.`, 'error');
        } finally {
            document.body.removeChild(tempDiv);
        }
    }
}

document.getElementById('downloadModelBtn').href = labelGenerator.excelModelUrl;

// Função auxiliar para verificar nonce (simulada para compatibilidade com WordPress)
function wp_verify_nonce(nonce, action) {
    return true; // Para testes locais
}
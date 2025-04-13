const { jsPDF } = window.jspdf;
let etiquetas = JSON.parse(localStorage.getItem('etiquetas')) || [];
let indiceEdicao = -1;

// Função para exibir notificações
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container') || createNotificationContainer();
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('role', 'alert');
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-btn" aria-label="Fechar notificação">×</button>
    `;
    container.appendChild(notification);

    notification.querySelector('.close-btn').addEventListener('click', () => {
        notification.remove();
    });

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Função auxiliar para criar o contêiner de notificações
function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
    return container;
}

// Função para validar EAN-13
function validarEAN13(ean) {
    if (!ean || ean.length !== 13 || !/^\d{13}$/.test(ean)) return false;
    const digits = ean.split('').map(Number);
    const checkDigit = digits.pop();
    const sum = digits.reduce((acc, digit, index) => {
        return acc + (index % 2 === 0 ? digit : digit * 3);
    }, 0);
    const calculatedCheckDigit = (10 - (sum % 10)) % 10;
    return calculatedCheckDigit === checkDigit;
}

// Função para abreviar nomes longos
function abreviarNome(nome) {
    const limite = 20;
    if (nome.length > limite) {
        return nome.substring(0, limite - 3) + '...';
    }
    return nome;
}

function adicionarEtiquetaIndividual() {
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
    let hasInvalidEAN = false;
    document.querySelectorAll('#codigosBarras .codigo-barra-item').forEach(item => {
        const ref = item.querySelector('.ref').value;
        const cor = item.querySelector('.cor').value;
        const ean = item.querySelector('.ean').value;
        if (ref || cor || ean) {
            if (ean && !validarEAN13(ean)) {
                hasInvalidEAN = true;
            }
            codigosBarras.push({ ref, cor, ean });
        }
    });

    if (hasInvalidEAN) {
        showNotification('Um ou mais códigos EAN-13 estão inválidos!', 'error');
        return;
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
        <button onclick="adicionarCodigoBarra()">Adicionar Código</button>
    `;
}

function adicionarCodigoBarra() {
    const container = document.getElementById('codigosBarras');
    const itens = container.querySelectorAll('.codigo-barra-item');
    if (itens.length < 6) {
        const novoItem = document.createElement('div');
        novoItem.className = 'codigo-barra-item';
        novoItem.innerHTML = `
            <input type="text" class="ref" placeholder="Ref">
            <input type="text" class="cor" placeholder="Cor">
            <input type="text" class="ean" placeholder="EAN 13">
            <button onclick="removerCodigoBarra(this)">Remover</button>
        `;
        container.insertBefore(novoItem, container.lastElementChild);
    } else {
        showNotification('Limite de 6 códigos de barras atingido!', 'warning');
    }
}

function removerCodigoBarra(botao) {
    botao.parentElement.remove();
}

function adicionarCodigoBarraEdicao() {
    const container = document.getElementById('editCodigosBarras');
    const itens = container.querySelectorAll('.codigo-barra-item');
    if (itens.length < 6) {
        const novoItem = document.createElement('div');
        novoItem.className = 'codigo-barra-item';
        novoItem.innerHTML = `
            <input type="text" class="ref" placeholder="Ref">
            <input type="text" class="cor" placeholder="Cor">
            <input type="text" class="ean" placeholder="EAN 13">
            <button onclick="removerCodigoBarra(this)">Remover</button>
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

function adicionarEtiquetasLote() {
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

                codigosBarras.forEach((codigo, idx) => {
                    if (codigo.ean && !validarEAN13(codigo.ean)) {
                        showNotification(`EAN inválido na linha ${rowIndex + 2}, código ${idx + 1}: ${codigo.ean}`, 'warning');
                    }
                });

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

        const nomeContainer = document.createElement('div');
        nomeContainer.className = 'nome-container';
        const ref = etiqueta.codigosBarras.length > 0 ? etiqueta.codigosBarras[0].ref : 'N/A';
        const nomeSpan = document.createElement('span');
        nomeSpan.className = 'nome';
        nomeSpan.textContent = `${abreviarNome(etiqueta.nome)} - Ref: ${ref}`;
        nomeContainer.appendChild(nomeSpan);

        const flag = document.createElement('span');
        flag.className = 'flag';
        flag.classList.add(etiqueta.foto ? 'com-imagem' : 'sem-imagem');
        flag.textContent = etiqueta.foto ? 'Com Imagem' : 'Sem Imagem';
        nomeContainer.appendChild(flag);

        div.appendChild(nomeContainer);

        const botoesContainer = document.createElement('div');
        botoesContainer.className = 'botoes-container';

        const btnEditar = document.createElement('button');
        btnEditar.className = 'editar';
        btnEditar.textContent = 'Editar';
        btnEditar.onclick = () => editarEtiqueta(index);
        botoesContainer.appendChild(btnEditar);

        const btnExcluir = document.createElement('button');
        btnExcluir.className = 'excluir';
        btnExcluir.textContent = 'Excluir';
        btnExcluir.onclick = () => excluirEtiqueta(index);
        botoesContainer.appendChild(btnExcluir);

        const btnVisualizar = document.createElement('button');
        btnVisualizar.className = 'visualizar';
        btnVisualizar.textContent = 'Visualizar';
        btnVisualizar.onclick = () => visualizarEtiqueta(index);
        botoesContainer.appendChild(btnVisualizar);

        const btnGerarPDF = document.createElement('button');
        btnGerarPDF.className = 'gerar-pdf';
        btnGerarPDF.textContent = 'Gerar PDF';
        btnGerarPDF.onclick = () => gerarPDFIndividual(index);
        botoesContainer.appendChild(btnGerarPDF);

        div.appendChild(botoesContainer);

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
            <button onclick="removerCodigoBarra(this)">Remover</button>
        `;
        codigosContainer.appendChild(div);
    });

    document.getElementById('editLightbox').style.display = 'flex';
    indiceEdicao = index;
}

function salvarEdicao() {
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
    let hasInvalidEAN = false;
    document.querySelectorAll('#editCodigosBarras .codigo-barra-item').forEach(item => {
        const ref = item.querySelector('.ref').value;
        const cor = item.querySelector('.cor').value;
        const ean = item.querySelector('.ean').value;
        if (ref || cor || ean) {
            if (ean && !validarEAN13(ean)) {
                hasInvalidEAN = true;
            }
            codigosBarras.push({ ref, cor, ean });
        }
    });

    if (hasInvalidEAN) {
        showNotification('Um ou mais códigos EAN-13 estão inválidos!', 'error');
        return;
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
        <div style="position: absolute; left: 115mm; top: ${30 + i * 20}mm; height: 20mm; font-size: 12pt; display: flex; align-items: center;">
            ${validarEAN13(codigo.ean) ? `<svg id="barcode${i}" style="margin-right: 5mm; width: 40mm; height: 12mm;"></svg><script>JsBarcode("#barcode${i}", "${codigo.ean}", { format: "EAN13", height: 48, width: 2, displayValue: true, fontSize: 14, margin: 0 });<\/script>` : `<span style="margin-right: 5mm;">EAN inválido</span>`}
            <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
                <div style="font-weight: bold;">REF: ${codigo.ref.toUpperCase()}</div>
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
                body { font-family: Arial, sans-serif; margin: 0; background-color: #f0f0f0; }
                .etiqueta-preview { width: 297mm; height: 210mm; background: url('${labelGenerator.backgroundImageUrl}') no-repeat center; background-size: cover; position: relative; }
                .bold { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="etiqueta-preview">
                ${etiqueta.foto ? `<img src="${etiqueta.foto}" style="position: absolute; left: 4.2mm; top: 31.5mm; width: 108mm; height: 73mm;">` : '<div style="position: absolute; left: 4.2mm; top: 31.5mm; width: 108mm; height: 73mm; font-size: 12pt;">Sem Imagem</div>'}
                <div style="position: absolute; left: 69.7mm; top: 11.9mm; font-size: 23pt; text-align: left;" class="bold">${etiqueta.nome}</div>
                <div style="position: absolute; left: 4.2mm; top: 111.5mm; font-size: 11pt; text-align: left;">Quantidade: ${etiqueta.quantidade}</div>
                <div style="position: absolute; left: 4.2mm; top: 116.0mm; font-size: 11pt; text-align: left;">Peso Bruto: ${etiqueta.peso}</div>
                <div style="position: absolute; left: 4.2mm; top: 120.5mm; font-size: 11pt; text-align: left;">Dimensões Produto: ${etiqueta.dimensoesProduto.comprimento}x${etiqueta.dimensoesProduto.largura}x${etiqueta.dimensoesProduto.altura} cm</div>
                <div style="position: absolute; left: 4.2mm; top: 125.0mm; font-size: 11pt; text-align: left;">Dimensões Embalagem: ${etiqueta.dimensoesEmbalagem.comprimento}x${etiqueta.dimensoesEmbalagem.largura}x${etiqueta.dimensoesEmbalagem.altura} cm</div>
                <div style="position: absolute; left: 4.2mm; top: 129.5mm; font-size: 11pt; text-align: left;">Validade: ${etiqueta.validade}</div>
                <div style="position: absolute; right: 185.2mm; top: 104.7mm; font-size: 20pt; text-align: left;" class="bold">${etiqueta.idade}</div>
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

function limparTudo() {
    if (etiquetas.length === 0) {
        showNotification('Não há etiquetas para limpar!', 'warning');
        return;
    }
    const confirmacao = confirm('Deseja realmente limpar todas as etiquetas?');
    if (confirmacao) {
        etiquetas = [];
        atualizarLista();
        showNotification('Todas as etiquetas foram limpas!', 'success');
    }
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
            if (validarEAN13(codigo.ean)) {
                return await generateBarcodeImage(codigo.ean);
            }
            return null;
        })
    );

    const codigosBarrasHTML = etiqueta.codigosBarras.map((codigo, i) => `
        <div style="position: absolute; left: 115mm; top: ${30 + i * 20}mm; height: 20mm; font-size: 12pt; display: flex; align-items: center;">
            ${barcodeImages[i] ? `<img src="${barcodeImages[i]}" style="margin-right: 5mm; width: 40mm; height: 12mm; border: none;">` : `<span style="margin-right: 5mm;">EAN inválido</span>`}
            <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
                <div style="font-weight: bold;">REF: ${codigo.ref.toUpperCase()}</div>
                <div style="display: flex; align-items: center; margin-top: 1mm;">
                    <span style="margin-right: 2mm; width: 5mm; height: 5mm; border: 1px solid black;"></span>${codigo.cor}
                </div>
            </div>
        </div>
    `).join('');

    const htmlContent = `
        <div class="etiqueta-preview" style="width: 297mm; height: 210mm; position: relative; font-family: Arial, sans-serif; background: transparent;">
            ${etiqueta.foto ? `<img src="${etiqueta.foto}" style="position: absolute; left: 4.2mm; top: 31.5mm; width: 108mm; height: 73mm;">` : '<div style="position: absolute; left: 4.2mm; top: 31.5mm; width: 108mm; height: 73mm; font-size: 12pt;">Sem Imagem</div>'}
            <div style="position: absolute; left: 69.7mm; top: 11.9mm; font-size: 23pt; text-align: left; font-weight: bold;">${etiqueta.nome}</div>
            <div style="position: absolute; left: 4.2mm; top: 111.5mm; font-size: 11pt; text-align: left;">Quantidade: ${etiqueta.quantidade}</div>
            <div style="position: absolute; left: 4.2mm; top: 116.0mm; font-size: 11pt; text-align: left;">Peso Bruto: ${etiqueta.peso}</div>
            <div style="position: absolute; left: 4.2mm; top: 120.5mm; font-size: 11pt; text-align: left;">Dimensões Produto: ${etiqueta.dimensoesProduto.comprimento}x${etiqueta.dimensoesProduto.largura}x${etiqueta.dimensoesProduto.altura} cm</div>
            <div style="position: absolute; left: 4.2mm; top: 125.0mm; font-size: 11pt; text-align: left;">Dimensões Embalagem: ${etiqueta.dimensoesEmbalagem.comprimento}x${etiqueta.dimensoesEmbalagem.largura}x${etiqueta.dimensoesEmbalagem.altura} cm</div>
            <div style="position: absolute; left: 4.2mm; top: 129.5mm; font-size: 11pt; text-align: left;">Validade: ${etiqueta.validade}</div>
            <div style="position: absolute; right: 185.2mm; top: 104.7mm; font-size: 20pt; text-align: left; font-weight: bold;">${etiqueta.idade}</div>
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

async function gerarPDFs() {
    if (etiquetas.length === 0) {
        showNotification('Não há etiquetas para gerar PDFs!', 'warning');
        return;
    }

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
                if (validarEAN13(codigo.ean)) {
                    return await generateBarcodeImage(codigo.ean);
                }
                return null;
            })
        );

        const codigosBarrasHTML = etiqueta.codigosBarras.map((codigo, i) => `
            <div style="position: absolute; left: 115mm; top: ${30 + i * 20}mm; height: 20mm; font-size: 12pt; display: flex; align-items: center;">
                ${barcodeImages[i] ? `<img src="${barcodeImages[i]}" style="margin-right: 5mm; width: 40mm; height: 12mm; border: none;">` : `<span style="margin-right: 5mm;">EAN inválido</span>`}
                <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
                    <div style="font-weight: bold;">REF: ${codigo.ref.toUpperCase()}</div>
                    <div style="display: flex; align-items: center; margin-top: 1mm;">
                        <span style="margin-right: 2mm; width: 5mm; height: 5mm; border: 1px solid black;"></span>${codigo.cor}
                    </div>
                </div>
            </div>
        `).join('');

        const htmlContent = `
            <div class="etiqueta-preview" style="width: 297mm; height: 210mm; position: relative; font-family: Arial, sans-serif; background: transparent;">
                ${etiqueta.foto ? `<img src="${etiqueta.foto}" style="position: absolute; left: 4.2mm; top: 31.5mm; width: 108mm; height: 73mm;">` : '<div style="position: absolute; left: 4.2mm; top: 31.5mm; width: 108mm; height: 73mm; font-size: 12pt;">Sem Imagem</div>'}
                <div style="position: absolute; left: 69.7mm; top: 11.9mm; font-size: 23pt; text-align: left; font-weight: bold;">${etiqueta.nome}</div>
                <div style="position: absolute; left: 4.2mm; top: 111.5mm; font-size: 11pt; text-align: left;">Quantidade: ${etiqueta.quantidade}</div>
                <div style="position: absolute; left: 4.2mm; top: 116.0mm; font-size: 11pt; text-align: left;">Peso Bruto: ${etiqueta.peso}</div>
                <div style="position: absolute; left: 4.2mm; top: 120.5mm; font-size: 11pt; text-align: left;">Dimensões Produto: ${etiqueta.dimensoesProduto.comprimento}x${etiqueta.dimensoesProduto.largura}x${etiqueta.dimensoesProduto.altura} cm</div>
                <div style="position: absolute; left: 4.2mm; top: 125.0mm; font-size: 11pt; text-align: left;">Dimensões Embalagem: ${etiqueta.dimensoesEmbalagem.comprimento}x${etiqueta.dimensoesEmbalagem.largura}x${etiqueta.dimensoesEmbalagem.altura} cm</div>
                <div style="position: absolute; left: 4.2mm; top: 129.5mm; font-size: 11pt; text-align: left;">Validade: ${etiqueta.validade}</div>
                <div style="position: absolute; right: 185.2mm; top: 104.7mm; font-size: 20pt; text-align: left; font-weight: bold;">${etiqueta.idade}</div>
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
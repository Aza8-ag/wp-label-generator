<div class="etiqueta-container">
    <div class="form-container">
        <form id="etiquetaForm">
            <label for="nome">Nome do Produto:</label>
            <input type="text" id="nome" placeholder="Nome do Produto">
            
            <label for="quantidade">Quantidade:</label>
            <input type="text" id="quantidade" placeholder="Ex: 1 Pç.">
            
            <label for="peso">Peso Bruto:</label>
            <input type="text" id="peso" placeholder="Ex: 12kg">
            
            <label>Dimensões Produto (cm):</label>
            <div class="dimension-inputs">
                <input type="text" id="prodComp" placeholder="Comprimento">
                <input type="text" id="prodLarg" placeholder="Largura">
                <input type="text" id="prodAlt" placeholder="Altura">
            </div>
            
            <label>Dimensões Embalagem (cm):</label>
            <div class="dimension-inputs">
                <input type="text" id="embComp" placeholder="Comprimento">
                <input type="text" id="embLarg" placeholder="Largura">
                <input type="text" id="embAlt" placeholder="Altura">
            </div>
            
            <label for="validade">Validade:</label>
            <input type="text" id="validade" placeholder="Ex: Indeterminada">
            
            <label for="idade">Idade Indicada:</label>
            <input type="text" id="idade" placeholder="Ex: 3 anos ou mais">
            
            <label for="lote">Lote de Produção:</label>
            <input type="text" id="lote" placeholder="Lote">
            
            <label for="foto">Foto do Produto:</label>
            <input type="file" id="foto" accept="image/*">
            
            <div id="codigosBarras">
                <label>Códigos de Barras:</label>
                <div class="codigo-barra-item">
                    <input type="text" class="ref" placeholder="Ref">
                    <input type="text" class="cor" placeholder="Cor">
                    <input type="text" class="ean" placeholder="EAN 13">
                </div>
                <button type="button" onclick="adicionarCodigoBarra()">Adicionar Código</button>
            </div>
        </form>
    </div>
    
    <div class="lista-container">
        <h2>Etiquetas Criadas</h2>
        <p id="contagem">Total de etiquetas: 0</p>
        <div id="etiquetas"></div>
    </div>
</div>

<div id="jsonLightbox" class="lightbox">
    <div class="lightbox-content">
        <div class="lightbox-scroll">
            <h2>Importar Etiquetas em Lote</h2>
            <p>Selecione um arquivo Excel (.xlsx ou .xls) com base no modelo fornecido.</p>
            <input type="file" id="excelInput" accept=".xlsx,.xls">
        </div>
        <div class="lightbox-actions">
            <button onclick="adicionarEtiquetasLote()">Importar</button>
            <button onclick="fecharJsonLightbox()">Fechar</button>
        </div>
    </div>
</div>

<div id="editLightbox" class="lightbox">
    <div class="lightbox-content">
        <div class="lightbox-scroll">
            <h2>Editar Etiqueta</h2>
            <form id="editEtiquetaForm">
                <label for="editNome">Nome do Produto:</label>
                <input type="text" id="editNome" placeholder="Nome do Produto">
                
                <label for="editQuantidade">Quantidade:</label>
                <input type="text" id="editQuantidade" placeholder="Ex: 1 Pç.">
                
                <label for="editPeso">Peso Bruto:</label>
                <input type="text" id="editPeso" placeholder="Ex: 12kg">
                
                <label>Dimensões Produto (cm):</label>
                <div class="dimension-inputs">
                    <input type="text" id="editProdComp" placeholder="Comprimento">
                    <input type="text" id="editProdLarg" placeholder="Largura">
                    <input type="text" id="editProdAlt" placeholder="Altura">
                </div>
                
                <label>Dimensões Embalagem (cm):</label>
                <div class="dimension-inputs">
                    <input type="text" id="editEmbComp" placeholder="Comprimento">
                    <input type="text" id="editEmbLarg" placeholder="Largura">
                    <input type="text" id="editEmbAlt" placeholder="Altura">
                </div>
                
                <label for="editValidade">Validade:</label>
                <input type="text" id="editValidade" placeholder="Ex: Indeterminada">
                
                <label for="editIdade">Idade Indicada:</label>
                <input type="text" id="editIdade" placeholder="Ex: 3 anos ou mais">
                
                <label for="editLote">Lote de Produção:</label>
                <input type="text" id="editLote" placeholder="Lote">
                
                <label for="editFoto">Foto do Produto:</label>
                <input type="file" id="editFoto" accept="image/*">
                
                <div id="editCodigosBarras">
                    <label>Códigos de Barras:</label>
                </div>
                <button type="button" onclick="adicionarCodigoBarraEdicao()">Adicionar Código</button>
            </form>
        </div>
        <div class="lightbox-actions">
            <button type="button" onclick="salvarEdicao()">Salvar</button>
            <button type="button" onclick="fecharLightbox()">Fechar</button>
        </div>
    </div>
</div>

<!-- Barra fixa inferior -->
<div class="bottom-bar">
    <button onclick="adicionarEtiquetaIndividual()">Adicionar</button>
    <button onclick="gerarPDFs()">Gerar PDFs</button>
    <button onclick="mostrarJsonLightbox()">Importar Lote</button>
    <button onclick="limparTudo()">Limpar</button>
    <a id="downloadModelBtn" href="<?php echo esc_url(LABEL_GENERATOR_PLUGIN_URL . 'models/modelo_etiquetas.xlsx'); ?>" download>Baixar Modelo</a>
</div>

<!-- Contêiner para notificações -->
<div class="notification-container" id="notification-container"></div>
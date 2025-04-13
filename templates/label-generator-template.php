<div class="etiqueta-container">
    <div class="form-container">
        <div id="etiquetaForm">
            <label for="nome"><?php esc_html_e('Nome do Produto:', 'wp-label-generator'); ?></label>
            <input type="text" id="nome" placeholder="<?php esc_attr_e('Nome do Produto', 'wp-label-generator'); ?>">
            
            <label for="quantidade"><?php esc_html_e('Quantidade:', 'wp-label-generator'); ?></label>
            <input type="text" id="quantidade" placeholder="<?php esc_attr_e('Ex: 1 Pç.', 'wp-label-generator'); ?>">
            
            <label for="peso"><?php esc_html_e('Peso Bruto:', 'wp-label-generator'); ?></label>
            <input type="text" id="peso" placeholder="<?php esc_attr_e('Ex: 12kg', 'wp-label-generator'); ?>">
            
            <label><?php esc_html_e('Dimensões Produto (cm):', 'wp-label-generator'); ?></label>
            <div class="dimension-inputs">
                <input type="text" id="prodComp" placeholder="<?php esc_attr_e('Comprimento', 'wp-label-generator'); ?>">
                <input type="text" id="prodLarg" placeholder="<?php esc_attr_e('Largura', 'wp-label-generator'); ?>">
                <input type="text" id="prodAlt" placeholder="<?php esc_attr_e('Altura', 'wp-label-generator'); ?>">
            </div>
            
            <label><?php esc_html_e('Dimensões Embalagem (cm):', 'wp-label-generator'); ?></label>
            <div class="dimension-inputs">
                <input type="text" id="embComp" placeholder="<?php esc_attr_e('Comprimento', 'wp-label-generator'); ?>">
                <input type="text" id="embLarg" placeholder="<?php esc_attr_e('Largura', 'wp-label-generator'); ?>">
                <input type="text" id="embAlt" placeholder="<?php esc_attr_e('Altura', 'wp-label-generator'); ?>">
            </div>
            
            <label for="validade"><?php esc_html_e('Validade:', 'wp-label-generator'); ?></label>
            <input type="text" id="validade" placeholder="<?php esc_attr_e('Ex: Indeterminada', 'wp-label-generator'); ?>">
            
            <label for="idade"><?php esc_html_e('Idade Indicada:', 'wp-label-generator'); ?></label>
            <input type="text" id="idade" placeholder="<?php esc_attr_e('Ex: 3 anos ou mais', 'wp-label-generator'); ?>">
            
            <label for="lote"><?php esc_html_e('Lote de Produção:', 'wp-label-generator'); ?></label>
            <input type="text" id="lote" placeholder="<?php esc_attr_e('Lote', 'wp-label-generator'); ?>">
            
            <label for="foto"><?php esc_html_e('Foto do Produto:', 'wp-label-generator'); ?></label>
            <input type="file" id="foto" accept="image/*">
            
            <div id="codigosBarras">
                <label><?php esc_html_e('Códigos de Barras:', 'wp-label-generator'); ?></label>
                <div class="codigo-barra-item">
                    <input type="text" class="ref" placeholder="<?php esc_attr_e('Ref', 'wp-label-generator'); ?>">
                    <input type="text" class="cor" placeholder="<?php esc_attr_e('Cor', 'wp-label-generator'); ?>">
                    <input type="text" class="ean" placeholder="<?php esc_attr_e('EAN 13', 'wp-label-generator'); ?>">
                </div>
                <button type="button" onclick="adicionarCodigoBarra()"><?php esc_html_e('Adicionar Código', 'wp-label-generator'); ?></button>
            </div>
        </div>
    </div>
    
    <div class="lista-container">
        <h2><?php esc_html_e('Etiquetas Criadas', 'wp-label-generator'); ?></h2>
        <p id="contagem"><?php esc_html_e('Total de etiquetas: 0', 'wp-label-generator'); ?></p>
        <div id="etiquetas"></div>
    </div>
</div>

<div id="jsonLightbox" class="lightbox">
    <div class="lightbox-content">
        <div class="lightbox-scroll">
            <h2><?php esc_html_e('Importar Etiquetas em Lote', 'wp-label-generator'); ?></h2>
            <p><?php esc_html_e('Selecione um arquivo Excel (.xlsx ou .xls) com base no modelo fornecido.', 'wp-label-generator'); ?></p>
            <input type="file" id="excelInput" accept=".xlsx,.xls">
        </div>
        <div class="lightbox-actions">
            <button onclick="adicionarEtiquetasLote()"><?php esc_html_e('Importar', 'wp-label-generator'); ?></button>
            <button onclick="fecharJsonLightbox()"><?php esc_html_e('Fechar', 'wp-label-generator'); ?></button>
        </div>
    </div>
</div>

<div id="editLightbox" class="lightbox">
    <div class="lightbox-content">
        <div class="lightbox-scroll">
            <h2><?php esc_html_e('Editar Etiqueta', 'wp-label-generator'); ?></h2>
            <div id="editEtiquetaForm">
                <label for="editNome"><?php esc_html_e('Nome do Produto:', 'wp-label-generator'); ?></label>
                <input type="text" id="editNome" placeholder="<?php esc_attr_e('Nome do Produto', 'wp-label-generator'); ?>">
                
                <label for="editQuantidade"><?php esc_html_e('Quantidade:', 'wp-label-generator'); ?></label>
                <input type="text" id="editQuantidade" placeholder="<?php esc_attr_e('Ex: 1 Pç.', 'wp-label-generator'); ?>">
                
                <label for="editPeso"><?php esc_html_e('Peso Bruto:', 'wp-label-generator'); ?></label>
                <input type="text" id="editPeso" placeholder="<?php esc_attr_e('Ex: 12kg', 'wp-label-generator'); ?>">
                
                <label><?php esc_html_e('Dimensões Produto (cm):', 'wp-label-generator'); ?></label>
                <div class="dimension-inputs">
                    <input type="text" id="editProdComp" placeholder="<?php esc_attr_e('Comprimento', 'wp-label-generator'); ?>">
                    <input type="text" id="editProdLarg" placeholder="<?php esc_attr_e('Largura', 'wp-label-generator'); ?>">
                    <input type="text" id="editProdAlt" placeholder="<?php esc_attr_e('Altura', 'wp-label-generator'); ?>">
                </div>
                
                <label><?php esc_html_e('Dimensões Embalagem (cm):', 'wp-label-generator'); ?></label>
                <div class="dimension-inputs">
                    <input type="text" id="editEmbComp" placeholder="<?php esc_attr_e('Comprimento', 'wp-label-generator'); ?>">
                    <input type="text" id="editEmbLarg" placeholder="<?php esc_attr_e('Largura', 'wp-label-generator'); ?>">
                    <input type="text" id="editEmbAlt" placeholder="<?php esc_attr_e('Altura', 'wp-label-generator'); ?>">
                </div>
                
                <label for="editValidade"><?php esc_html_e('Validade:', 'wp-label-generator'); ?></label>
                <input type="text" id="editValidade" placeholder="<?php esc_attr_e('Ex: Indeterminada', 'wp-label-generator'); ?>">
                
                <label for="editIdade"><?php esc_html_e('Idade Indicada:', 'wp-label-generator'); ?></label>
                <input type="text" id="editIdade" placeholder="<?php esc_attr_e('Ex: 3 anos ou mais', 'wp-label-generator'); ?>">
                
                <label for="editLote"><?php esc_html_e('Lote de Produção:', 'wp-label-generator'); ?></label>
                <input type="text" id="editLote" placeholder="<?php esc_attr_e('Lote', 'wp-label-generator'); ?>">
                
                <label for="editFoto"><?php esc_html_e('Foto do Produto:', 'wp-label-generator'); ?></label>
                <input type="file" id="editFoto" accept="image/*">
                
                <div id="editCodigosBarras">
                    <label><?php esc_html_e('Códigos de Barras:', 'wp-label-generator'); ?></label>
                </div>
                <button type="button" onclick="adicionarCodigoBarraEdicao()"><?php esc_html_e('Adicionar Código', 'wp-label-generator'); ?></button>
            </div>
        </div>
        <div class="lightbox-actions">
            <button type="button" onclick="salvarEdicao()"><?php esc_html_e('Salvar', 'wp-label-generator'); ?></button>
            <button type="button" onclick="fecharLightbox()"><?php esc_html_e('Fechar', 'wp-label-generator'); ?></button>
        </div>
    </div>
</div>

<div id="confirmLightbox" class="lightbox">
    <div class="notification-content confirm">
        <p class="notification-message"></p>
        <div class="notification-actions">
            <button onclick="confirmNotification(true)">Sim</button>
            <button class="cancel" onclick="confirmNotification(false)">Não</button>
        </div>
    </div>
</div>

<!-- Barra fixa inferior -->
<div class="bottom-bar">
    <button onclick="adicionarEtiquetaIndividual()"><?php esc_html_e('Adicionar', 'wp-label-generator'); ?></button>
    <button onclick="gerarPDFs()"><?php esc_html_e('Gerar PDFs', 'wp-label-generator'); ?></button>
    <button onclick="mostrarJsonLightbox()"><?php esc_html_e('Importar Lote', 'wp-label-generator'); ?></button>
    <button onclick="exportarJSON()"><?php esc_html_e('Exportar JSON', 'wp-label-generator'); ?></button>
    <button onclick="limparTudo()"><?php esc_html_e('Limpar', 'wp-label-generator'); ?></button>
    <a id="downloadModelBtn" href="<?php echo esc_url(LABEL_GENERATOR_PLUGIN_URL . 'models/modelo_etiquetas.xlsx'); ?>" download><?php esc_html_e('Baixar Modelo', 'wp-label-generator'); ?></a>
</div>

<!-- Contêiner para notificações flutuantes -->
<div class="toast-container" id="toastContainer"></div>
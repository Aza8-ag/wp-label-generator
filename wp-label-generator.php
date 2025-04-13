<?php
/*
Plugin Name: Generator de Etiqueta - Bangtoys
Description: Um plugin para gerar etiquetas de produtos diretamente em uma página do WordPress. Desenvolvido pela Aza8 para Bangtoys.
Version: 1.3
Author: Aza8
*/

// Evitar acesso direto
if (!defined('ABSPATH')) {
    exit;
}

// Definir constantes
define('LABEL_GENERATOR_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('LABEL_GENERATOR_PLUGIN_URL', plugin_dir_url(__FILE__));

// Incluir funções administrativas
if (is_admin()) {
    require_once LABEL_GENERATOR_PLUGIN_DIR . 'includes/admin/admin-functions.php';
}

// Enfileirar scripts e estilos
function label_generator_enqueue_scripts() {
    $slug = get_option('label_generator_page_slug', 'gerador-de-etiquetas');
    if (is_page($slug)) {
        // Estilos
        wp_enqueue_style('label-generator-styles', LABEL_GENERATOR_PLUGIN_URL . 'assets/css/styles.css', [], '1.3');

        // Bibliotecas externas
        wp_enqueue_script('html2canvas', LABEL_GENERATOR_PLUGIN_URL . 'assets/js/html2canvas.min.js', [], '1.4.1', true);
        wp_enqueue_script('jspdf', LABEL_GENERATOR_PLUGIN_URL . 'assets/js/jspdf.umd.min.js', [], '2.5.1', true);
        wp_enqueue_script('jsbarcode', LABEL_GENERATOR_PLUGIN_URL . 'assets/js/JsBarcode.all.min.js', [], '3.11.5', true);
        wp_enqueue_script('xlsx', LABEL_GENERATOR_PLUGIN_URL . 'assets/js/xlsx.full.min.js', [], '0.18.5', true);

        // Script principal
        wp_enqueue_script('label-generator-script', LABEL_GENERATOR_PLUGIN_URL . 'assets/js/script.js', ['html2canvas', 'jspdf', 'jsbarcode', 'xlsx'], '1.3', true);

        // Passar URLs e nonce
        wp_localize_script('label-generator-script', 'labelGenerator', [
            'backgroundImageUrl' => LABEL_GENERATOR_PLUGIN_URL . 'assets/images/fundo_etiqueta.jpg',
            'excelModelUrl' => LABEL_GENERATOR_PLUGIN_URL . 'models/modelo_etiquetas.xlsx',
            'nonce' => wp_create_nonce('label_generator_nonce')
        ]);
    }
}
add_action('wp_enqueue_scripts', 'label_generator_enqueue_scripts');

// Criar shortcode para exibir o gerador de etiquetas
function label_generator_shortcode() {
    // Verificar permissões
    $permission = get_option('label_generator_permission', 'edit_posts');
    if (!current_user_can($permission)) {
        return '<p>' . esc_html__('Você não tem permissão para acessar esta ferramenta.', 'wp-label-generator') . '</p>';
    }

    // Verificar nonce
    $nonce = wp_create_nonce('label_generator_nonce');
    ob_start();
    ?>
    <div id="label-generator-nonce" data-nonce="<?php echo esc_attr($nonce); ?>"></div>
    <?php
    include LABEL_GENERATOR_PLUGIN_DIR . 'templates/label-generator-template.php';
    return ob_get_clean();
}
add_shortcode('label_generator', 'label_generator_shortcode');

// Carregar traduções
function label_generator_load_textdomain() {
    load_plugin_textdomain('wp-label-generator', false, dirname(plugin_basename(__FILE__)) . '/languages');
}
add_action('plugins_loaded', 'label_generator_load_textdomain');
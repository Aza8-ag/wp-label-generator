<?php
// Evitar acesso direto
if (!defined('ABSPATH')) {
    exit;
}

// Registrar menu de configurações
function label_generator_admin_menu() {
    add_options_page(
        __('Configurações do Gerador de Etiquetas', 'wp-label-generator'),
        __('Gerador de Etiquetas', 'wp-label-generator'),
        'manage_options',
        'label-generator-settings',
        'label_generator_settings_page'
    );
}
add_action('admin_menu', 'label_generator_admin_menu');

// Registrar configurações
function label_generator_register_settings() {
    register_setting('label_generator_settings_group', 'label_generator_page_slug', [
        'sanitize_callback' => 'sanitize_text_field',
        'default' => 'gerador-de-etiquetas'
    ]);
    register_setting('label_generator_settings_group', 'label_generator_permission', [
        'sanitize_callback' => 'sanitize_text_field',
        'default' => 'edit_posts'
    ]);
}
add_action('admin_init', 'label_generator_register_settings');

// Página de configurações
function label_generator_settings_page() {
    ?>
    <div class="wrap">
        <h1><?php esc_html_e('Configurações do Gerador de Etiquetas', 'wp-label-generator'); ?></h1>
        <form method="post" action="options.php">
            <?php settings_fields('label_generator_settings_group'); ?>
            <?php do_settings_sections('label_generator_settings_group'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="label_generator_page_slug"><?php esc_html_e('Slug da Página', 'wp-label-generator'); ?></label>
                    </th>
                    <td>
                        <input type="text" id="label_generator_page_slug" name="label_generator_page_slug" value="<?php echo esc_attr(get_option('label_generator_page_slug', 'gerador-de-etiquetas')); ?>" class="regular-text" />
                        <p class="description"><?php esc_html_e('Define o slug da página do gerador de etiquetas.', 'wp-label-generator'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="label_generator_permission"><?php esc_html_e('Permissão de Acesso', 'wp-label-generator'); ?></label>
                    </th>
                    <td>
                        <select id="label_generator_permission" name="label_generator_permission">
                            <option value="edit_posts" <?php selected(get_option('label_generator_permission', 'edit_posts'), 'edit_posts'); ?>><?php esc_html_e('Editar Posts', 'wp-label-generator'); ?></option>
                            <option value="manage_options" <?php selected(get_option('label_generator_permission', 'edit_posts'), 'manage_options'); ?>><?php esc_html_e('Gerenciar Opções', 'wp-label-generator'); ?></option>
                        </select>
                        <p class="description"><?php esc_html_e('Define quem pode acessar o gerador de etiquetas.', 'wp-label-generator'); ?></p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// Atualizar criação da página com base nas configurações
function label_generator_create_page_with_settings() {
    $slug = get_option('label_generator_page_slug', 'gerador-de-etiquetas');
    if (!get_page_by_path($slug)) {
        $page = array(
            'post_title'   => __('Gerador de Etiquetas', 'wp-label-generator'),
            'post_content' => '[label_generator]',
            'post_status'  => 'publish',
            'post_type'    => 'page',
            'post_name'    => $slug,
        );
        wp_insert_post($page);
    }
}
register_activation_hook(__FILE__, 'label_generator_create_page_with_settings');
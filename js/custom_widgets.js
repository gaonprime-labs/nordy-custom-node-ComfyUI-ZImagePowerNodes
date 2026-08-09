/**
 * File    : custom_widgets.js
 * Purpose : Register all custom widgets used in this project.
 * Author  : Martin Rizzo | <martinrizzo@gmail.com>
 * Date    : Feb 3, 2026
 * Repo    : https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes
 * License : MIT
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *                        ComfyUI-ZImagePowerNodes
 *       ComfyUI nodes designed specifically for the "Z-Image" model.
 *_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
*/
import { app }                          from "../../../scripts/app.js";
import { GalleryWidget }                from "./custom_widgets/gallery_widget.js";
import { SeparatorWidget }              from "./custom_widgets/separator_widget.js";
import { addStyleGalleryButton }        from "./custom_widgets/style_gallery_button.js";
import { CustomStylesComboController }  from "./custom_widgets/custom_styles_combo.js";
import { StyleWidgetDelegate  , requireVisualStyleGalleryDialog  } from "./custom_widgets/ui_styles.js";
import { PaletteWidgetDelegate, requireColorPaletteGalleryDialog } from "./custom_widgets/ui_palettes.js";
const ENABLED = true;


/**
 * Adds a separator widget to the node.
 *
 * The data[1] (options) object supports the following properties:
 *  - `mode`      {string}: Determines the visual appearance. Available modes:
 *                          "spacer" (empty vertical padding), "divider" (standard line),
 *                          "dotted" (dashed line), or "bold" (thick line).
 *  - `color`     {string}: A CSS color string to define the line color.
 *  - `height`    {number}: The total vertical space allocated for the widget in pixels.
 *  - `thickness` {number}: The line weight in pixels.
 *
 * @param {object} node - The node instance where the widget will be attached.
 * @param {string} name - The name identifier for the widget.
 * @param {Array}  data - Configuration array where:
 *                        - [0] = widget type name
 *                        - [1] = object containing the optional configurations.
 * @param {object} _app - The ComfyApp instance.
 *
 * @returns {{ widget: object }}
 *     An object containing the added separator widget instance.
 */
function _addSeparator(node, name, data, _app) {
    const type    = data[0];
    const options = data[1] || {};
    const widget  = node.addCustomWidget( new SeparatorWidget(type, name, options) );
    return { widget: widget };
}


/**
 * Adds a "Style Selector" widget that utilizes a gallery dialog to select the style.
 *
 * @param {object} node - The node instance where the widget will be attached.
 * @param {string} name - The name identifier for the widget.
 * @param {Array}  data - Configuration array where:
 *                        - [0] = widget type name
 *                        - [1] = object containing the optional configurations.
 * @param {object} _app - The ComfyApp instance.
 *
 * @returns {{ widget: object }}
 *     An object containing the added style selector widget.
 */
function _addStyleSelector(node, name, data, _app) {
    const type          = data[0];
    const options       = data[1] || {};
    const endpoint      = options.endpoint   || "";
    const imagesURL     = options.images_url || "";
    const dialogOptions = options.dialog || {};
    const widgetDelegate = new StyleWidgetDelegate(endpoint, imagesURL);
    let widget = new GalleryWidget(type, node, name, options, widgetDelegate, (widget) =>
    {
        // launch dialog and update widget value
        const styleDialog  = requireVisualStyleGalleryDialog(endpoint, imagesURL);
        const currentStyle = widget.value;
        styleDialog.launch( dialogOptions, currentStyle, (selectedStyle) => {
            widget.forceUpdate( selectedStyle );
        });
    });
    widget = node.addCustomWidget( widget );
    return { widget: widget };
}


/**
 * Adds a "Palette Selector" widget that utilizes a gallery dialog to select a palette.
 *
 * @param {object} node - The node instance where the widget will be attached.
 * @param {string} name - The name identifier for the widget.
 * @param {Array}  data - Configuration array where:
 *                        - [0] = widget type name
 *                        - [1] = object containing the optional configurations.
 * @param {object} _app - The ComfyApp instance.
 *
 * @returns {{ widget: object }}
 *     An object containing the added palette selector widget.
 */
function _addPaletteSelector(node, name, data, _app) {
    const type           = data[0];
    const options        = data[1] || {};
    const endpoint       = options.endpoint || "";
    const dialog_options = options.dialog || {};
    let widget = new GalleryWidget(type, node, name, options, new PaletteWidgetDelegate(endpoint), (widget) =>
    {
        // launch dialog and update widget value
        const paletteDialog  = requireColorPaletteGalleryDialog(endpoint);
        const currentPalette = widget.value;
        paletteDialog.launch( dialog_options, currentPalette, (selectedPalette) => {
            widget.forceUpdate( selectedPalette );
        });
    });
    widget = node.addCustomWidget( widget );
    return { widget: widget };
}


/**
 * Adds a Combo widget that automatically synchronizes custom styles from
 * the user's style definitions.
 *
 * @param {object} node - The node instance where the widget will be attached.
 * @param {string} name - The name identifier for the widget.
 * @param {Array}  data - Configuration array where:
 *                        - [0] = widget type name
 *                        - [1] = object containing the optional configurations.
 * @param {object} _app - The ComfyApp instance.
 *
 * @returns {{ widget: object }}
 *     An object containing the added combo box widget.
 */
function _addCustomStyleSelector(node, name, data, _app) {
    const _type         = data[0];
    const widgetOptions = data[1] || {};
    const defaultValue  = widgetOptions.default;

    // create the widget and apply the controller to it
    widgetOptions.values = [];
    const widget = node.addWidget('combo', name, defaultValue, function () {}, widgetOptions);
    node.zipnCustStylesController = new CustomStylesComboController(widget, node, widgetOptions.options);
    return { widget: widget };
}


//#=========================================================================#
//#////////////////////////// REGISTER EXTENSION ///////////////////////////#
//#=========================================================================#

app.registerExtension({
    name: "ZImagePowerNodes.CustomWidgets",

    /** Called when the extension is loaded. */
    init() {
        if( !ENABLED ) return;
        console.log(`[${this.name}]: Extension loaded.`);
    },

    /** Called to register custom widgets. */
    getCustomWidgets() {
        if( !ENABLED ) return {};
        return {
            "ZIPN_SEPARATOR"            : _addSeparator,
            "ZIPN_PALETTE_SELECTOR"     : _addPaletteSelector,
            "ZIPN_STYLE_SELECTOR"       : _addStyleSelector,
            "ZIPN_CUSTOM_STYLE_SELECTOR": _addCustomStyleSelector,

            // [DEPRECATED]
            "ZIPN_STYLE_GALLERY_BUTTON": addStyleGalleryButton,
        };
    },

});

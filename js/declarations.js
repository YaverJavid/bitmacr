/*
   NOTICE
   ONLY SOME DECLARATIONS HERE
*/

let controlWidth = parseFloat(getComputedStyle(document.getElementsByClassName("controls")[1]).getPropertyValue("width"))
const cells = document.getElementsByClassName("cell"),
    cellsSlider = id('cells-slider'),
    paintZone = id('paint-zone'),
    colorSelector = id('color-selector'),
    canvasSizeShower = id("canvas-size-shower"),
    guideCheckbox = id("guide-checkbox"),
    guideCheckbox2 = id("guide-checkbox2"),
    borderCheckbox = id("border-checkbox"),
    cellBorderWidthSlider = id("cell-border-width-slider"),
    cellBorderWidthShower = id("cell-border-width-shower"),
    multiplyQButton = id("multiply-q-button"),
    selectAllCopyTargets = id("select-all-copy-targets"),
    multiplyQSelector = id("multiply-q-selector"),
    copyTargetsShower = id("copy-targets-shower"),
    colorToBeReplacedSelector = id("color-to-be-replaced-selector"),
    colorToReplaceWithSelector = id("color-to-replace-with-selector"),
    replaceButton = id("replace-button"),
    thresholdShower = id("threshold-shower"),
    colorMatchThresholdSlider = id("color-match-threshold-range"),
    root = document.querySelector(":root"),
    bottomControls = id("bottom-control-container"),
    menuNav = id("menu-nav"),
    menus = bottomControls.children,
    cellBorderColorSelector = id("cell-border-color-selector"),
    guideCellBorderColor = id("guide-cell-border-color"),
    drawingName = id("drawing-name"),
    saveTolocalStorageREF = id("save-to-ls"),
    drawingsSection = id("drawings-section"),
    drawingsContainer = id("drawings"),
    colsPainter = id("cols-painter"),
    rowsPainter = id("rows-painter"),
    themeSelectors = document.getElementsByClassName("theme-selector"),
    paintMode = id("paint-mode"),
    topImage = id("top-image"),
    pallateContainer = id("pallate-container"),
    copiedColorShower = id("copied-color-shower"),
    drawingCheckerSection = id("drawingPreview"),
    paintModeSelector = id("paint-mode-selector"),
    clickModeSelector = id("click-mode-selector"),
    guideCellBorder2 = id('guide-cell-border2'),
    bottomControlsContainer = id("bottom-control-container"),
    cellBorderOnTransparentCellsCheckbox = id("cell-border-on-transparent-cells-checkbox"),
    themesSection = id("themes-section"),
    onlyFillIfColorIsCheckbox = id("only-fill-if-color-is"),
    colorStringInput = id("color-string-input"),
    hueSpeedSlider = id("hue-speed-slider"),
    saturationSlider = id("saturation-slider"),
    lightingSlider = id("lighting-slider"),
    hueAngle = id("hue-angle"),
    hueSpeedShower = id("hue-speed-shower"),
    lightingShower = id("lighting-shower"),
    saturationShower = id("saturation-shower"),
    colorVariationThSlider = id("color-variation-th-slider"),
    colorVariationThShower = id("color-variation-th-shower"),
    hueAngleShower = id("hue-angle-shower"),
    slightVariationsCheckbox = id("slight-variations-checkbox"),
    replaceWithNormalCheckbox = id("replace-with-normal"),
    fillOnlyThisColor = id("fill-only-this-color"),
    deleteNonDefaultPallette = id("delete-non-default-pallette"),
    shiftLeft = id("shift-left"),
    wrapShift = id("wrap-shift"),
    changePaletteCreatorColor = id("change-palette-creator-color"),
    multiplyTargetCheckboxes = {
        q1MultiplyTargetCheckbox: id("q1-multiply-target-checkbox"),
        q2MultiplyTargetCheckbox: id("q2-multiply-target-checkbox"),
        q3MultiplyTargetCheckbox: id("q3-multiply-target-checkbox"),
        q4MultiplyTargetCheckbox: id("q4-multiply-target-checkbox")
    },
    clickManagerCheckboxes = {
        colorSelectCheckbox: id("select-color"),
        selectColorForFind: id("select-color-for-find"),
        selectColorForReplacer: id("select-color-for-replacer"),
        copyColorFromCellCheckbox: id("copy-color-from-cell-checkbox"),
        selectHueFromCell: id("select-hue-from-cell"),
        selectSaturationFromCell: id("select-saturation-cell"),
        selectLightingFromCell: id("select-lighting-cell"),
        selectForOnlyFillIf: id("select-for-only-fill-if"),
        selectColorForPaletteCreator: id("select-color-for-palette-creator"),
        pasteOnClick: id("paste-onclick-checkbox"),
        onclickFillCol: id("onclick-fill-col"),
        onclickFillRow: id("onclick-fill-row"),
        selectHitsSpecificColor: id("select-hits-specific-color"),
        cp1 : id('cp-gradient-start-color'),
        cp2 : id('cp-gradient-end-color')
    },
    autoSave = id("auto-save"),
    addNewSessionOnOpening = id("add-new-session-on-opening"),
    pasteTransparentCellEffect = id("paste-transparent-cell-effect")
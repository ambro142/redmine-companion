class Icon {

    // Возвращает HTML иконки. Цвет иконки = цвет текста вокруг (currentColor),
    // сами файлы лежат в assets/icons, а подключаются через CSS-классы .ico-<name>.
    static html(name, extraClass = "") {

        const cls = ("ico ico-" + name + " " + extraClass).trim();

        return '<span class="' + cls + '" aria-hidden="true"></span>';

    }

}

window.Icon = Icon;

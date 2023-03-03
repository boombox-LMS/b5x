# Custom theming instructions

`theme-template.js` is provided as a template for theme configuration. The live theme configuration file should be named `active-theme.js` and located in the same folder. If no file called 'theme.js' is found during the build step, it will be created as an identical copy of `theme-template.js`.

`active-theme.js` is intentionally ignored in version control, since theme customization is a local customization. With that in mind, it's wise to keep a backup copy of any customized versions you create.
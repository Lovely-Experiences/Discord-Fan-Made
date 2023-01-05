<picture>
  <source media="(prefers-color-scheme: dark)" srcset="client/assets/images/icon/white.png" height="150px" width="150px">
  <source media="(prefers-color-scheme: light)" srcset="client/assets/images/icon/white.png" height="150px" width="150px">
  <img alt="Icon">
</picture>

# Discord-Fan-Made

This is a fan made version of Discord, with way less features of course. This is still being created, and may not function or work correctly. If you would like to contribute, don't hesitate to make a pull request or issue!

The reason behind this project is to attempt at making something well maintained and organized. While also learning stuff along the way! This project is more of just something to have fun and mess around with. However, the code behind this project is taken seriously and the security measures are too.

Thanks, Jacob Humston

## Install

To get started you'll need to install node.js if you have not already from https://nodejs.org/.

Once you have node.js installed, it's advised to create a folder specifically for this project somewhere on your computer.

You'll want to click the **Code** button, then download the ZIP file. Then simply unzip it into the folder you created.
> **Note** - You can also use git if you know how, however that will not be explained here. **Link:** https://github.com/jacobhumston-school/Discord-Fan-Made.git

Once you have the files in place, you will want to run the following commands to install dependencies.

```console
cd /path/to/the/folder/
npm ci
```
Make sure to include the correct path to the folder. In some (not all) file explorers, you can copy the path by right clicking on the folder.

> **Warning** - Running the `npm ci` command will delete the `node_modules` folder if it is already present. [Learn more.](https://docs.npmjs.com/cli/v9/commands/npm-ci)

> **Note** - You could technically use `npm install` instead of `npm ci`, however that is generally unrecommended.

## Configuration 

To configure the project, you can edit the configuration file found in `server/configuration.json`.

Explanations coming soon...

## Startup

Once you have installed the dependencies, you are ready to start the project. You can start it by executing the following command. You will be asked to set the admin password on the first startup.

```console
node .
```

If you get any errors that you are unsure how to fix, please report them as an [issue](https://github.com/jacobhumston-school/Discord-Fan-Made/issues/new).

## Credits

- **Discord Icons:** https://discord-avatar-maker.app/
- **Miscellaneous Icons:** https://fonts.google.com/icons?icon.style=Rounded&icon.set=Material+Icons

*This project is not affiliated nor endorsed by Discord.*

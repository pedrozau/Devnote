const {app,BrowserWindow,Menu,dialog,ipcMain,shell} = require('electron')
const fs = require('fs')
const path = require('path')
let mainWindow = null
let file = {}
async function createWindow() {

   mainWindow = new BrowserWindow({
        width:700,
        height:500,
        webPreferences:{
            nodeIntegration:true,
            contextIsolation:false,
        }
   })

   await mainWindow.loadFile('./index.html')
   //mainWindow.webContents.openDevTools()
   createNewFile()

   ipcMain.on('update-content',(event,data) => {
      file.content = data

   })


}



function createNewFile() {
  file = {
     name:'novo-arquivo.txt',
     content:'',
     saved:false,
     path: app.getPath('documents') + '/novo-arquivo.txt'
  }

   mainWindow.webContents.send('set-file',file)
}


function writeFile(filePath) {
    try{
       fs.writeFile(filePath,file.content,(error) => {
          if(error) throw error;

           file.path = filePath
           file.saved = true
           file.name = path.basename(filePath)

            mainWindow.webContents.send('set-file',file)
       })

    }catch(e){
      console.log(e)
    }
}


async function saveFileAs() {

  let dialogFile = await dialog.showSaveDialog({
      defaultPath:file.path
  })

   if(dialogFile.canceled){
     return false
   }

   writeFile(dialogFile.filePath)

}

function saveFile() {
   if(file.saved){
      return writeFile(file.path)
   }

    return saveFileAs()
}

async function openFile() {
     let dialogFile = await dialog.showOpenDialog({
         defaultPath: file.path
     })

      if(dialogFile.canceled) return false;

      file = {
         name: path.basename(dialogFile.filePaths[0]),
         content:readFile(dialogFile.filePaths[0]),
         saved:true,
         path: dialogFile.filePaths[0]
      }
      mainWindow.webContents.send('set-file',file)
}

function readFile(filePath){
    try{
       return fs.readFileSync(filePath,'utf8')
    }catch(e){
      return ''
    }
}


app.whenReady().then(createWindow)

// activate
app.on('activate',()=>{
    if(BrowserWindow.getAllWindo().lenght() == 0){
       createWindow()
    }
})

let templateMenu = [
     {
       label:'Arquivo',
       submenu:[
           {
             label:'Novo',
              accelerator:'CmdOrCtrl+N'
             ,
             click(){
                createNewFile()
             }
           },
           {
             label:'Abrir',
             accelerator:'CmdOrCtrl+O'
             ,
             click(){
                openFile()
             }
           },
           {
             label:'Salvar',
             accelerator:'CmdOrCtrl+S'
             ,
             click(){
                saveFile()
             }
           },
           {
             label:'Salvar como',
             accelerator:'CmdOrCtrl+Shift+S'
             ,
             click(){
                saveFileAs()
             }
           },
           {
             label:'Fechar',
             accelerator:'CmdOrCtrl+Q'
             ,
             role:process.plaform == 'darwin' ? 'close':'quit'
           }
       ]
     },
     {
       label:'Editar',
       submenu:[
           {
             label:'Desfazer',
             role:'undo'
           },
           {
             label:'Resfazer',
             role:'redo'
           },
           {
             type:'separator'
           }
           ,
           {
             label:'Copiar',
             role:'copy'
           },
           {
             label:'Cortar',
             role:'cut'
           },
           {
             label:'Colar',
             role:'paste'
           }
       ]
     },
     {
       label:'Sobre',
       submenu:[
          {
            label:'Criado com electron.js version 16.0.4'
          },
          {
            type:'separator'
          },
          {
            label:'By Pedro Zau Dev'
          }
       ]
     },
     {
        label:'Ajuda',
        submenu:[
          {
            label:'Site',
            click() {
              shell.openExternal('https://free.facebook.com/pedrozau.zau.33')
            }

          }


        ]

     }
]

let menu = Menu.buildFromTemplate(templateMenu)

Menu.setApplicationMenu(menu)

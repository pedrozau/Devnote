const {ipcRenderer} = require('electron')

const app = new Vue({
   el:'#app',
   data:{
     fileName:'',
     titleFile:'DevNote'

   },
   methods:{
        getText:function(){
           ipcRenderer.send('update-content',this.fileName)

        }

   }

   ,
    created(){
      ipcRenderer.on('set-file',(event,data)=>{
           this.fileName = data.content
           this.titleFile = data.name + '  |  DevNote'
      })



    }

})

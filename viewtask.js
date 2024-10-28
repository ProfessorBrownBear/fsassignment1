document.querySelector('#searchbtn').addEventListener('click',()=>{
    let id = document.querySelector('#search').value;
    if(id)
        window.open(`/tasks/${id}`,'_self');
    else
        window.open('/tasks','_self');
})
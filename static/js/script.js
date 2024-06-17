document.addEventListener('DOMContentLoaded', function() {
    // Fonction pour rafraîchir la liste des équipements
    function refreshEquipments() {
        fetch('/get-equipments')
            .then(response => response.json())
            .then(data => {
                var tableBody = document.getElementById('equipment-list');
                tableBody.innerHTML = '';
                data.forEach(consigne => {
                    var newRow = document.createElement('tr');

                    // Création des cellules pour chaque consigne
                    var consigneCell = document.createElement('td');
                    consigneCell.textContent = consigne;

                    var obligatoryCell = document.createElement('td');
                    var obligatoryCheckbox = document.createElement('input');
                    obligatoryCheckbox.type = 'checkbox';
                    obligatoryCheckbox.name = 'obligatoire_' + consigne;
                    obligatoryCheckbox.id = 'obligatoire_' + consigne;
                    obligatoryCheckbox.classList.add('obligatoire');
                    obligatoryCheckbox.setAttribute('data-consigne', consigne);
                    obligatoryCheckbox.setAttribute('data-room-id', room_id);
                    if (selected_consignes['obligatory_' + consigne]) {
                        obligatoryCheckbox.checked = true;
                    }
                    obligatoryCell.appendChild(obligatoryCheckbox);

                    var recommendedCell = document.createElement('td');
                    var recommendedCheckbox = document.createElement('input');
                    recommendedCheckbox.type = 'checkbox';
                    recommendedCheckbox.name = 'recommended_' + consigne;
                    recommendedCheckbox.id = 'recommended_' + consigne;
                    recommendedCheckbox.classList.add('recommended');
                    recommendedCheckbox.setAttribute('data-consigne', consigne);
                    recommendedCheckbox.setAttribute('data-room-id', room_id);
                    if (selected_consignes['recommended_' + consigne]) {
                        recommendedCheckbox.checked = true;
                    }
                    recommendedCell.appendChild(recommendedCheckbox);

                    // Création de la cellule de suppression
                    var deleteCell = document.createElement('td');
                    deleteCell.classList.add('no-border');
                    var deleteButton = document.createElement('button');
                    deleteButton.textContent = 'X';
                    deleteButton.classList.add('delete-button');
                    deleteButton.setAttribute('data-consigne', consigne);
                    deleteCell.appendChild(deleteButton);

                    // Ajout des cellules à la nouvelle ligne
                    newRow.appendChild(consigneCell);
                    newRow.appendChild(obligatoryCell);
                    newRow.appendChild(recommendedCell);
                    newRow.appendChild(deleteCell);

                    // Ajout de la nouvelle ligne au tableau
                    tableBody.appendChild(newRow);

                    // Gestion des événements de changement des cases à cocher
                    obligatoryCheckbox.addEventListener('change', function() {
                        if (this.checked) {
                            document.getElementById('recommended_' + consigne).checked = false;
                        }
                    });

                    recommendedCheckbox.addEventListener('change', function() {
                        if (this.checked) {
                            document.getElementById('obligatoire_' + consigne).checked = false;
                        }
                    });

                    // Gestion de l'événement de suppression
                    deleteButton.addEventListener('click', function() {
                        var consigne = this.getAttribute('data-consigne');
                        deleteEquipment(consigne);
                    });
                });
            });
    }

    // Fonction pour supprimer un équipement
    function deleteEquipment(consigne) {
        fetch('/delete-equipment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ equipment: consigne })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                toastr.success('Équipement supprimé avec succès');
                refreshEquipments();
            } else {
                toastr.error('Erreur lors de la suppression de l\'équipement');
            }
        });
    }

    // Rafraîchir les équipements au chargement de la page
    refreshEquipments();

    // Ajouter un nouvel équipement
    document.getElementById('add-consigne').addEventListener('click', function() {
        var newConsigne = document.getElementById('new-consigne').value;
        if (newConsigne.trim() !== '') {
            fetch('/add-equipment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ equipment: newConsigne })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    toastr.success('Équipement ajouté avec succès');
                    refreshEquipments();
                } else {
                    toastr.error('Erreur lors de l\'ajout de l\'équipement');
                }
            });

            document.getElementById('new-consigne').value = '';
        }
    });

    // Soumettre les consignes modifiées
    document.getElementById('submit-consignes').addEventListener('click', function() {
        var roomId = room_id;
        saveConsignes(roomId);
    });

    // Fonction pour sauvegarder les consignes
    function saveConsignes(roomId) {
        var obligatoryConsignes = [];
        var recommendedConsignes = [];

        document.querySelectorAll('.obligatoire').forEach(function(checkbox) {
            if (checkbox.checked && checkbox.dataset.roomId == roomId) {
                obligatoryConsignes.push(checkbox.getAttribute('data-consigne'));
            }
        });

        document.querySelectorAll('.recommended').forEach(function(checkbox) {
            if (checkbox.checked && checkbox.dataset.roomId == roomId) {
                recommendedConsignes.push(checkbox.getAttribute('data-consigne'));
            }
        });

        fetch('/send-consignes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ room_id: roomId, obligatory: obligatoryConsignes, recommended: recommendedConsignes })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                toastr.success('Consignes modifiées avec succès');
            } else {
                toastr.error('Erreur lors de la modification des consignes');
            }
        });
    }
});

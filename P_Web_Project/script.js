document.addEventListener('DOMContentLoaded', () => {
    const itemForm = document.getElementById('item-form');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const getLocationBtn = document.getElementById('get-location');
    const locationDisplay = document.getElementById('location-display');
    const searchInput = document.getElementById('search-input');
    const itemsList = document.getElementById('items-list');

    let currentLocation = null;

    // Image preview
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Get location
    getLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                locationDisplay.textContent = `Location: ${currentLocation.lat}, ${currentLocation.lng}`;
            }, (error) => {
                console.error('Error getting location:', error);
                locationDisplay.textContent = 'Unable to get location';
            });
        } else {
            locationDisplay.textContent = 'Geolocation is not supported by this browser';
        }
    });

    // Form submission
    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const itemType = document.getElementById('item-type').value;
        const description = document.getElementById('description').value;
        const imageSrc = imagePreview.src;

        if (!currentLocation) {
            alert('Please get your location first');
            return;
        }

        const item = {
            id: Date.now(),
            type: itemType,
            description,
            image: imageSrc,
            location: currentLocation,
            timestamp: new Date().toISOString()
        };

        addItem(item);
        displayItems();
        itemForm.reset();
        imagePreview.style.display = 'none';
        locationDisplay.textContent = '';
        currentLocation = null;
    });

    // Search functionality
    searchInput.addEventListener('input', () => {
        displayItems();
    });

    function addItem(item) {
        const items = JSON.parse(localStorage.getItem('lostFoundItems') || '[]');
        items.push(item);
        localStorage.setItem('lostFoundItems', JSON.stringify(items));
    }

    function displayItems() {
        const items = JSON.parse(localStorage.getItem('lostFoundItems') || '[]');
        const searchTerm = searchInput.value.toLowerCase();
        const filteredItems = items.filter(item =>
            item.description.toLowerCase().includes(searchTerm)
        );

        itemsList.innerHTML = '';
        filteredItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.innerHTML = `
                <h3>${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Item</h3>
                <p>${item.description}</p>
                <img src="${item.image}" alt="Item image">
                <p>Location: ${item.location.lat}, ${item.location.lng}</p>
                <div id="map-${item.id}" style="height: 200px; width: 100%;"></div>
                <p>Posted: ${new Date(item.timestamp).toLocaleString()}</p>
            `;
            itemsList.appendChild(itemDiv);

            // Initialize map (using a simple placeholder, in a real app you'd use a mapping library)
            const mapDiv = document.getElementById(`map-${item.id}`);
            mapDiv.textContent = `Map showing location at ${item.location.lat}, ${item.location.lng}`;
        });
    }

    // Display items on load
    displayItems();
});
// Loading main page (SPA)


// Web page for buyer or seller
const contentContainer = document.querySelector('section .container-fluid');
let userSession = JSON.parse(sessionStorage.getItem('userSession'));
const sendToDb = (type) => {
    if(type === 'seller'){
        db.collection("produkty").orderBy('created_at', 'desc').onSnapshot(snapshot => {

            snapshot.docChanges().forEach(change => {
                const doc = change.doc;
                if(doc.data().author === userSession.login){  
                    if(change.type === 'added'){
                        addProduct(doc.data(), doc.id);
                    }else if(change.type === 'removed'){
                        deleteProduct(doc.id);
                    }else if(change.type === 'modified'){
                        deleteProduct(doc.id);
                        addProduct(doc.data(), doc.id);           
                    }
                }
            });

            checkIfHaveProducts().then(product => {
                const userType = document.querySelector('.user--accType');
                if(product.length > 1 ){
                    userType.innerHTML =`Aktualnie sprzedajesz ${product.length} produkty`;
                }else if(product.length == 1){
                    userType.innerHTML =`Aktualnie sprzedajesz ${product.length} produkt`;
                }
                else{
                    userType.innerHTML = `<h3 class="text-center py-5" >Aktualnie nic nie sprzedajesz... 😕</h3>`;
                }
            });
            // Delete item for seller
            const deleteBtn = document.querySelectorAll('.delete--offer');
            deleteBtn.forEach(btn => {
                btn.addEventListener('click', e => {
                    e.preventDefault();
                    snapshot.docs.forEach(doc => {
                        if(doc.id === btn.getAttribute("data-product")){
                            removeProduct(doc.data(), doc.id);
                        }
                    })
                })
            });
            
            // Modify item for seller
            const modifyProduct = document.querySelectorAll('.modify--offer')
            modifyProduct.forEach(item => {
                item.addEventListener('click', e => {
                    // console.log(item);
                    e.preventDefault();
                    snapshot.docs.forEach(doc => {
                        if(doc.id === item.getAttribute("data-product")){
                            modifyModal(doc.data(), doc.id);
                        }
                    })
                });
            })
        });
    }else if(type === 'buyer'){
        db.collection("produkty").get().then(snapshot => {
            snapshot.docs.forEach((doc) => {
                showFavProducts(doc, doc.id);
            });
            const btn = document.querySelectorAll('.show--offer');
            btn.forEach(item => {
                item.addEventListener('click', e => {
                    e.preventDefault();
                       snapshot.docs.forEach(doc => {
                            if(doc.id === item.getAttribute("data-product")){
                                removeFromFavourite(doc.data(), doc.id);
                            }
                       });
                });
            })
        }).catch(err => {
            console.log(err);
        });
    }
}
const userType = () => {
contentContainer.childNodes[3].style.display="";
const userType = document.querySelector('.user--accType');

// const userName = document.querySelector('.user--name');
const row = document.querySelector('.row.store--items');
    // userName.innerHTML+= `${userSession.name}!`;
    if(userSession.radioType === "buyer"){
        userType.innerHTML = `Aktualnie obserwujesz:`;
        // showStatistics();
            if(userSession.products.length === 0){
                row.innerHTML=`<h3 class="text-center py-5" >Coś tu pusto... 😭</h3>`;
            }else{
                sendToDb(userSession.radioType);
                
            }
    }else{ 
        // createAd();
        // showStatistics();
        sendToDb(userSession.radioType);
        // showStatistics();

    }
}

const userNavbar = () => {
    const userNav = document.querySelector('.user--account');
    let html = ``;
    if (userSession.radioType === 'buyer'){
        html = `
        <div class="myacc-container">
            <ul>
                <li class="nav-item"><a class="nav-link active fw-bold" aria-current="page" href="#">Obserwowane produkty</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Ustawienia konta</a></li>
                <li class="nav-item"><a class="nav-link" href="#">Wiadomości</a></li>
                <button type="button" class="btn btn-danger clear--fav">Usuń produkty z obserwowanych</button>
            </ul>
        </div>
        `
    }else{
        html = `
        <div class="myacc-container">
        <ul>
            <li class="nav-item"><a class="nav-link active fw-bold" aria-current="page" href="#">Sprzedawane</a></li>
            <li class="nav-item"><a class="nav-link" href="#">Ustawienia konta</a></li>
            <li class="nav-item"><a class="nav-link" href="#">Wiadomości</a></li>
            <button type="button" class="btn btn-light create--offer" data-bs-toggle="modal" data-bs-target="#addNewProductModal">Utwórz ogłoszenie</button>
        </ul>
        </div>
        `
    }
    userNav.innerHTML = html;
};


const checkIfHaveProducts = async () => {
    db.collection('produkty').get().then(doc => {
        if(doc.exists){
            console.log(doc.data());
        }else{
            console.log('err');
        }
    })
    const items = document.querySelectorAll('.product--item');
    return items;
}


const compareItems = (product, id) => {
    let html = ``;
    let matched = false;
    userSession.products.forEach(item => {
        if(item === id){
            matched=true;
        }
    });
    if(matched){
        product = product.data();
        html = `
        <div class="col-xl-4 col-xxl-4 col-md-6 mb-5 product--item" data-id="${id}">
        <div class="card bg-light border-0 h-100">
            <div class="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
                <h3 class="fs-4 fw-bold p-3">${product.title}</h3>
                    <p class="p-2">Dodano: ${getTime(product)}</p>
                    <a href="${product.img_address}" data-lightbox="${product.author}" data-title="${product.title}">
                        <img src="${imgTemplate(product.img_address)}" class="img-thumbnail img-fluid" alt="${product.title}" data-lightbox="${product.author}" data-title="${product.img_address}">
                    </a> 
                    <p class="productName"><span>Nazwa:</span> ${product.title}</p>
                    <p class="productPrice"><span>Cena:</span> ${product.cena} zł</p>
                    <p class="productSpecs"><span>Opis:</span> ${product.description}</p>
                    <p class="productSpecs"><span>Sprzedaje:</span> ${product.author}</p>
                    <button type="button" class="btn btn-primary show--offer" data-bs-toggle="modal" data-bs-target="#showProductModal" data-product="${id}">Przejdź do oferty</button>
            </div>
        </div>
        </div>`;

    }
    return html;
}

const showFavProducts = (product, id) => {
    const row = document.querySelector('.row.store--items');
    row.innerHTML += compareItems(product, id);
}

// page for seller
const createAd = () => {
    const row = document.querySelector('.create--ad');
    let html = `
    <div class="col-xl-6 col-xxl-6 mb-5">
    <div class="card bg-light border-0 h-100">
        <div class="card-body p-4 p-lg-5 pt-0 pt-lg-0">
            <h3 class="fs-4 fw-bold p-3">Dodaj ogłoszenie</h3>
                <button type="button" class="btn btn-primary create--offer" data-bs-toggle="modal" data-bs-target="#addNewProductModal">Utwórz ogłoszenie</button>
            </div>
        </div>
    </div>
    `;
    row.innerHTML = html;
}

// showing actual selling products
const addProduct = (product, id) => {
    // getTime(product);
    // console.log(showTime);
    const showList = document.querySelector('.store--items');
    let html = `
    <div class="col-xl-4 col-xxl-4 col-md-6 mb-5 product--item" data-id="${id}">
    <div class="card bg-light border-0 h-100">
        <div class="card-body text-center p-4 p-lg-5 pt-0 pt-lg-0">
            <h3 class="fs-4 fw-bold p-3">${product.title}</h3>
                <p class="p-2">Dodano: ${getTime(product)}</p>
                <a href="${imgTemplate(product.img_address)}" data-lightbox="${product.title}" data-title="${product.title}">
                    <img src="${imgTemplate(product.img_address)}" onerror="this.onerror=null;this.src='assets/img/noimg.jpg';" class="img-thumbnail img-fluid" alt="${product.title}" data-lightbox="${product.title}" data-title="${product.img_address}">
                </a> 
                <p class="productName"><span>Nazwa:</span> ${product.title}</p>
                <p class="productPrice"><span>Cena:</span> ${product.cena} zł</p>
                <p class="productSpecs"><span>Opis:</span> ${product.description}</p>
                <button type="button" class="btn btn-primary modify--offer" data-bs-toggle="modal" data-bs-target="#modifyProduct" data-product="${id}">Modyfikuj ogłoszenie</button>
                <button type="button" class="btn btn-danger delete--offer" data-bs-toggle="modal" data-bs-target="#deleteProduct" data-product="${id}">Zakończ sprzedaż</button>
        </div>
    </div>
    </div>
    `
    showList.innerHTML += html;
}

const removeProduct = (product, id) => {
    const data = document.querySelector('.delete-content');
    let html = `
        <div class="product-desc">
            <p>ID produktu: ${id}</p>
            <p>Nazwa produktu: ${product.title}</p>
            <p>Cena: ${product.cena}</p>
            <p>Opis: ${product.description}</p>
            <p>Szczegółowy opis: ${product.long_desc}</p>
        </div>
        <div class="product-img">
        <a href="${product.img_address}" data-lightbox="${product.author}" data-title="${product.title}">
            <img src="${product.img_address}" class="img-thumbnail img-fluid" alt="${product.title}" data-lightbox="${product.author}" data-title="${product.img_address}">
        </a>
        </div>
    `
    data.innerHTML = html;

    const modalFooter = document.querySelector("#deleteProduct > div > div > div.modal-footer")
    modalFooter.innerHTML = `
        <button type="button" class="btn btn-danger removeAd" data-bs-dismiss="modal">Usuń ogłoszenie <i class="bi bi-trash"></i>
        </button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zamknij</button>
        <h3 class="feedback"></h3>
    `;

    const btn = document.querySelector('.removeAd');
    btn.addEventListener('click', e => {
        e.preventDefault();
        db.collection('produkty').doc(id).delete().then(() => {
            console.log('usunieto');
        })
    });
}

const deleteProduct = (id) => {
    const product = document.querySelectorAll('.product--item');
    product.forEach(item => {
        if(item.getAttribute('data-id') === id){
            item.remove();
        }
    });
}

// Showing basic statistics like name,surname,voivodeship, phone number etc.
const showStatistics = async () => {
    const row = document.querySelector('.create--ad');
    let quantity = 0;
    let userText=``;
        if(userSession.radioType === 'seller'){
            await db.collection('produkty').get().then(snap => {
                snap.docs.forEach(doc => {
                    if (doc.data().author === userSession.login){
                        quantity++;
                        userText = `<p>Ilość sprzedawanych rzeczy: ${quantity}  </p>`
                    }
                })
            });
        }else if(userSession.radioType === 'buyer'){
            quantity = userSession.products.length;
            userText = `<p>Ilość obserwowanych rzeczy: ${quantity}  </p>`
        }

    let html = `
    <div class="col-xl-6 col-xxl-6 mb-5">
    <div class="card bg-light border-0 h-100">
        <div class="card-body p-4 p-lg-5 pt-0 pt-lg-0">
            <h3 class="fs-4 fw-bold p-3">Twoje dane:</h3>
                <p>Imię: ${userSession.name}</p>
                <p>Nazwisko: ${userSession.surname}</p>
                <p>Email: ${userSession.email}</p>
                <p>Numer telefonu: ${userSession.tel}</p>
                <p>Login: ${userSession.login} </p>
                <p>Województwo: ${userSession.voivode}</p>
                <p>Zainteresowania: ${userSession.hobby}</p>
                ${userText}
            </div>
        </div>
    </div>
    `;
    row.innerHTML += html;
}

// Adding product to database
const addToDbBtn = document.querySelector('.addTo--db');
addToDbBtn.addEventListener('click', e => {
    e.preventDefault();
    const form = document.querySelector("#addNewProductModal > div > div > div.modal-body > form");
    const now = new Date();
    let newAd = {
        author: userSession.login,
        created_at: firebase.firestore.Timestamp.fromDate(now),
        title: title.value,
        cena: cena.value,
        description: desc.value,
        img_address: img_address.value,
        long_desc: long_desc.value
    };

    db.collection("produkty").add(newAd).then(() => {
        console.log('dodano produkt');
        form.reset();
    }).catch(err => {
        console.log(err);
    });
});

const modifyModal = (product, id) => {
    // console.log('clicked');
    const newModal = document.querySelector("#modifyProduct > div > div");
    // console.log(newModal);
    let html = `
    <div class="modal-header bg-primary">
    <h5 class="modal-title text-white" id="exampleModalLabel">Modyfikuj produkt</h5>
    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
        <form>
            <div class="form-group row">
              <label for="title" class="col-sm-2 col-form-label">Nazwa produktu</label>
              <div class="col-sm-10">
                <input type="text" class="form-control" id="modifyTitle" placeholder="Nazwa produktu" required value="${product.title}">
              </div>
            </div>
            <div class="form-group row">
              <label for="cena" class="col-sm-2 col-form-label">Cena</label>
              <div class="col-sm-10">
                <input type="number" class="form-control" id="modifyCena" placeholder="Cena" required value="${product.cena}">
              </div>
            </div>
            <div class="form-group row">
                <label for="desc" class="col-sm-2 col-form-label">Opis</label>
                <div class="col-sm-10">
                    <input type="text" class="form-control" id="modifyDesc" placeholder="Dodaj podstawowe informacje o produkcie..." required value="${product.description}">
                </div>
            </div>
            <div class="form-group row">
                <label for="img_address" class="col-sm-2 col-form-label">Zdjęcia</label>
                <div class="col-sm-10">
                  <input type="text" class="form-control" id="modifyImg_address" placeholder="Podaj adres URL do zdjęcia.." required value="${product.img_address}">
                </div>
            </div>
            <div class="form-group row">
                <label for="long_desc" class="col-sm-2 col-form-label">Opis szczegółowy</label>
                <div class="col-sm-10">
                  <textarea id="modifyLong_desc" class="form-control" cols="30" rows="10" placeholder="Podaj szczegółowe dane o produkcie..." required>${product.long_desc}</textarea>
                </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-success modify--record" data-bs-dismiss="modal">Modyfikuj rekord <i class="bi bi-check2"></i>
            </button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zamknij</button>
        </div>
    `;
    newModal.innerHTML = html;
    // title.setAttribute("value", product.title);
    // cena.setAttribute("value", product.cena);
    // desc.setAttribute("value", product.description);
    // img_address.setAttribute("value", product.img_address);
    // long_desc.value = product.long_desc;
    
    // const modal = document.querySelector('#addNewProductModal > div > div > div.modal-footer');
    // modal.innerHTML = `
    // <button type="button" class="btn btn-success modify--record" data-bs-dismiss="modal">Modyfikuj rekord <i class="bi bi-check2"></i>
    // </button>
    // <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zamknij</button>
    // `;

    modifyRecord(id)
}

const modifyRecord = (id) => {
    const modifyDbBtn = document.querySelector('.modify--record');
    modifyDbBtn.addEventListener('click', e => {
        e.preventDefault();
        const now = new Date();
        console.log(title);
        const newAd = {
            author: userSession.login,
            created_at: firebase.firestore.Timestamp.fromDate(now),
            title: modifyTitle.value,
            cena: modifyCena.value,
            description: modifyDesc.value,
            img_address: modifyImg_address.value,
            long_desc: modifyLong_desc.value
        };
        console.log(id, newAd);
        db.collection("produkty").doc(id).update(newAd).then(() => {
            console.log('zmodyfikowano produkt');
        }).catch(err => {
            console.log(err);
        });
    });
}

if(userSession === null){
    location.replace('index.html');
}else{
    userNavbar();
    userType();
}


const userNavigation = document.querySelectorAll('.myacc-container ul li > a');
// clear font weigth on clicking in nav
const clearNavigationStatus = () => {
    userNavigation.forEach(link => {
        link.classList.remove('fw-bold', 'active');
    });
};

const userSettingsContainer = () => {
    const userSettings = document.querySelector('.user--settings');
    let html = `

    <div class="row mb-5">
    <div class="col-sm-6 mb-5">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Zmień hasło</h5>
          <p class="card-text">Wprowadź swoje stare hasło, w celu weryfikacji i utwórz silniejsze hasło!</p>
          <a href="#" class="btn btn-primary change-pass">Zmień hasło</a>
        </div>
      </div>
    </div>
    <div class="col-sm-6 mb-5">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Edytuj dane adresowe</h5>
          <p class="card-text">Jeżeli zmieniłeś miejsce zamieszkania, bądź wprowadziłeś błędne dane, tutaj możesz je zmienić.</p>
          <a href="#" class="btn btn-primary change-address" data-bs-toggle="modal" data-bs-target="#showUserModal">Zmień dane adresowe</a>
        </div>
      </div>
    </div>
    <div class="col-sm-6 mb-5">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Aktualne informacje o koncie</h5>
        <p class="card-text">Tutaj znajdziesz wszystkie informacje dotyczące twojego konta.</p>
        <a href="#" class="btn btn-primary show-profile" data-bs-toggle="modal" data-bs-target="#showUserModal">Zobacz profil</a>
      </div>
    </div>
  </div>
  <div class="col-sm-6 mb-5">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title">Usuń konto</h5>
      <p class="card-text">W celu usunięcia konta i zarchiwizowania wszystkich istniejących ofert kliknij tutaj.</p>
      <a href="#" class="btn btn-primary delete-account" data-bs-toggle="modal" data-bs-target="#showUserModal">Usuń konto</a>
    </div>
  </div>
</div>
  </div>

  <div class="modal fade" id="showUserModal" tabindex="-1" aria-labelledby="showUserModal" aria-hidden="true">
  <div class="modal-dialog modal-xl">
      <div class="modal-user">
      </div>
  </div>
</div>
    `;
    userSettings.innerHTML = html;
};

const userMessagesContainer = () => {
    const userMessages = document.querySelector('.user--messages');
    let html = `
    <div class="d-flex position-relative bg-light p-2 mb-3">
    <div class="p-3">
      <h5 class="mt-0">Custom component with stretched link</h5>
      <p>This is some placeholder content for the custom component. It is intended to mimic what some real-world content would look like, and we're using it here to give the component a bit of body and size.</p>
      <a href="#" class="stretched-link">Go somewhere</a>
    </div>
  </div>
  <div class="d-flex position-relative bg-light p-2 mb-3">
  <div class="p-3">
    <h5 class="mt-0">Custom component with stretched link</h5>
    <p>This is some placeholder content for the custom component. It is intended to mimic what some real-world content would look like, and we're using it here to give the component a bit of body and size.</p>
    <a href="#" class="stretched-link">Go somewhere</a>
  </div>
</div>
    `;
    userMessages.innerHTML = html;

}

const voivodeValidate = () => {
    if(voisSelect.value === ""){
        return false
    }else{
        return voisSelect.value;
    }
};

userNavigation.forEach((link, index) => {
    const storeItems = document.querySelector('.store--items');
    const userAcc = document.querySelector('.user--accType');
    const userSettings = document.querySelector('.user--settings');
    const userMessages = document.querySelector('.user--messages');
    switch(index){
        case 0:
            link.addEventListener('click', e => {
                e.preventDefault();
                clearNavigationStatus();
                link.classList.add('fw-bold', 'active');
                if(userSession.radioType == 'seller'){
                    userAcc.innerHTML = ``;
                    checkIfHaveProducts().then(product => {
                        const userType = document.querySelector('.user--accType');
                        if(product.length > 1 ){
                            userType.innerHTML +=`Aktualnie sprzedajesz ${product.length} produkty`;
                        }else if(product.length == 1){
                            userType.innerHTML +=`Aktualnie sprzedajesz ${product.length} produkt`;
                        }
                        else{
                            userType.innerHTML = `<h3 class="text-center py-5" >Aktualnie nic nie sprzedajesz... 😕</h3>`;
                        }
                    });
                }else{
                    userAcc.innerHTML = "Aktualnie obserwujesz: ";
                }
                storeItems.style.display = "";
                userMessages.style.display = "none";
                userSettings.style.display = "none"; 
            });
            break;
        case 1:
            link.addEventListener('click', e => {
                e.preventDefault();
                clearNavigationStatus();
                link.classList.add('fw-bold', 'active');
                storeItems.style.display = "none";
                userMessages.style.display = "none";
                userSettings.style.display = "";
                userAcc.innerHTML = `<h3>Ustawienia konta</h3>`;
                userSettingsContainer();
                const content = document.querySelector('.modal-user');
                const deleteUserBtn = document.querySelector('.delete-account');
                deleteUserBtn.addEventListener('click', e => {
                    e.preventDefault();
                    const html = ` <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                      <h5 class="modal-title">Uwaga!</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>   
                    <div class="modal-body">
                    <p>Czy napewo zamierzasz usunąć swoje konto?</p>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
                    <button type="button" class="btn btn-danger delete-account-btn" data-bs-dismiss="modal">Usuń konto</button>
                  </div>
                </div>`;
                    content.innerHTML = html;
                    // delete user and his ads if he's seller
                    const deleteUser = document.querySelector('.delete-account-btn');
                    deleteUser.addEventListener('click', e => {
                        e.preventDefault();
                        db.collection('produkty').get().then(doc => {
                            doc.forEach(item => {
                                if(item.data().author === userSession.login){
                                    console.log(item.id, item.data());
                                    db.collection('produkty').doc(item.id).delete().then(() =>{
                                        console.log('usunieto produkty pomyslnie!');
                                    })
                                }
                            })
                        });
                        db.collection('users').where("login", "==", userSession.login).get().then(data => {
                            data.forEach(item => {
                                db.collection('users').doc(item.id).delete().then(() => {
                                    console.log(`Szkoda że odchodzisz od nas ${userSession.login}, zapraszamy ponownie :)`);
                                    location.replace('index.html');
                                })
                            })
                        })
                        sessionStorage.clear();
                    })
                });
                // show information about account
                const userInfoBtn = document.querySelector('.show-profile');
                userInfoBtn.addEventListener('click', e => {
                    e.preventDefault();
                    let userAccType;
                    if(userSession.radioType === 'seller'){
                            userAccType = 'sprzedawca';
                        }else{
                            userAccType = 'kupujący';
                        }
                    const html = ` <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">Twoje aktualne dane</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>   
                    <div class="modal-body">
                    <p>Twoje aktualne dane są następujące: </p>
                    <p>Login: ${userSession.login}</p>
                    <p>Email: ${userSession.email}</p>
                    <p>Imię: ${userSession.name}</p>
                    <p>Nazwisko: ${userSession.surname}</p>
                    <p>Telefon: ${userSession.tel}</p>
                    <p>Województwo: ${userSession.voivode}</p>
                    <p>Typ konta: ${userAccType}</p>
                    <p>Hobby: <span class="user-hobby"> </span></p>
                    <p>Ilość produktów: <span class="user-products"></span></p>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zamknij</button>
                  </div>
                </div>`;
                    content.innerHTML = html;
                    const userHobby = document.querySelector('.user-hobby');
                    userSession.hobby.forEach(item => {
                        userHobby.innerHTML += `${item} `;
                    })
                    const userProducts = document.querySelector('.user-products');
                    if(userSession.radioType === 'seller'){
                        db.collection('produkty').get().then(doc => {
                            let sum=0;
                            doc.forEach(item =>{
                                if(item.data().author === userSession.login){
                                    sum++;
                                }
                            })
                            userProducts.innerHTML = sum;
                        })
                    }else{
                        userSession.products.forEach(() => {
                            if(userSession.products.length === 1){
                                userProducts.innerHTML = `0`;
                            }else{
                                userProducts.innerHTML = userSession.products.length;
                            }
                        });
                    }
                });
                // edit user data
                const userEditBtn = document.querySelector('.change-address');
                userEditBtn.addEventListener('click', e => {
                    e.preventDefault();
                    const html = ` <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title">Twoje aktualne dane</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>   
                    <div class="modal-body">
                    <form>
                    <p class="text-primary">Wprowadź dane osobiste</p>
                    <div>
                        <label>Imię</label> <br>
                        <input type="text" name="name" value="${userSession.name}"> 
                    </div>
                    <div>
                        <label>Nazwisko</label> <br>
                        <input type="text" name="surname" value="${userSession.surname}"> 
                    </div>
                    <div>
                        <label>Numer Telefonu</label> <br>
                        <input type="text" name="tel" value="${userSession.tel}"> 
                    </div>
                    <p class="text-primary">Wybierz województwo: </p>
                    <div>
                        <select name="voivodeship" id="voisSelect">
                            <option selected value="">--Wybierz województwo--</option>
                            <option value="dolnoslaskie">dolnośląskie</option>
                            <option value="kujawsko-pomorskie">kujawsko-pomorskie</option>
                            <option value="lubelskie">lubelskie</option>
                            <option value="lubuskie">lubuskie</option>
                            <option value="łódzkie">łódzkie</option>
                            <option value="małopolskie">małopolskie</option>
                            <option value="mazowieckie">mazowieckie</option>
                            <option value="opolskie">opolskie</option>
                            <option value="podkarpackie">podkarpackie</option>
                            <option value="podlaskie">podlaskie</option>
                            <option value="pomorskie">pomorskie</option>
                            <option value="śląskie">śląskie</option>
                            <option value="świętokrzyskie">świętokrzyskie</option>
                            <option value="warmińsko-mazurskie">warmińsko-mazurskie</option>
                            <option value="wielkopolskie">wielkopolskie</option>
                            <option value="zachodniopomorskie">zachodniopomorskie</option>
                        </select>
                    </div>
                    <p class="text-primary">Wybierz swoje zaintersowania: </p>
                    <div class="checkbox">
                        <label class="not">Samochody</label><input type="checkbox" name="hobby" value="cars" >
                        <label class="not">Elektronika</label><input type="checkbox" name="hobby" value="electronics" >
                        <label class="not">Projektowanie wnętrz</label><input type="checkbox" name="hobby" value="home" >
                        <label class="not">Ogród </label><input type="checkbox" name="hobby" value="garden" >
                        <label class="not">Inne</label><input type="checkbox" name="hobby" value="other" >
                    </div>        
                </form>
                    </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-primary userData-change">Zapisz dane</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zamknij</button>
                  </div>
                </div>`;
                    content.innerHTML = html;
                    
                    const userDataChangeBtn = document.querySelector('.userData-change');
                    const form = document.querySelector('form');
                      
                    userDataChangeBtn.addEventListener('click', e => {
                        e.preventDefault();
                        let newVoivode=undefined;
                        if(voivodeValidate()){
                            newVoivode = voivodeValidate();
                        }else{
                            newVoivode=userSession.voivode;
                        }
                        const checkboxs = document.querySelectorAll('input[name="hobby"]');
                        let checkArr = [];
                        checkboxs.forEach(item => {
                            if(item.checked){
                                checkArr.push(item.value);
                            }
                        });
                        db.collection('users').get().then(doc => {
                            doc.forEach(user => {
                                if(userSession.login === user.data().login){
                                    const newUserData = {
                                        email: userSession.email,
                                        hobby: checkArr,
                                        login: userSession.login,
                                        name: form.name.value,
                                        pass: userSession.pass,
                                        products: userSession.products,
                                        radioType: userSession.radioType,
                                        surname: form.surname.value,
                                        tel: form.tel.value,
                                        voivode: newVoivode
                                    };
                                    db.collection("users").doc(user.id).update(newUserData).then(() => {
                                        form.innerHTML=`<span class="text-success">Dane zostały pomyślnie zmienione!</span>`;
                                        userDataChangeBtn.remove();
                                    });
                                }
                            });
                        })
                    });
                });
            
            });
            break;
        case 2:
            link.addEventListener('click', e => {
                e.preventDefault();
                clearNavigationStatus();
                link.classList.add('fw-bold', 'active')
                storeItems.style.display = "none";
                userMessages.style.display = "";
                userSettings.style.display = "none";
                userAcc.innerHTML = `<h3>Wiadomości</h3>`;
                userMessagesContainer();
            });
            break;
    }
});


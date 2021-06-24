let markersAll = []
//let infoWindow = null
// Initialize and add the map
window.initMap= () => {
    // The location of Uluru
    const obelisco = { lat: -34.603544, lng: -58.381586 }; //Obelisco
    // The map, centered at Uluru
    const map = new google.maps.Map(
      document.getElementById("map"),{
        zoom: 5,
        center: obelisco,
        styles: styles,
        streetViewControl:false,
        fullscreenControl: false,
        mapTypeControlOptions:{
          mapTypeIds:[]
        },
        zoomControlOptions:{
          position: google.maps.ControlPosition.RIGHT_BOTTOM
        }
      }
    );

    fetchMarkers(map)
    //Aca voy hacer el fetch de markers

    //Filtros
    const $filter = document.querySelectorAll('.handleFilter')
    $filter.forEach((filter)=>{
      filter.addEventListener('click',(e)=>{
        const filterQuery = filter.innerHTML;
        addMarkersFiltered(filterQuery, map)
      })
    })

    /*const $filterReset = document.querySelector('.handleFilterReset')
    $filterReset.addEventListener('click', ()=>{
      markersAll.forEach((marker)=>{
        marker.setMap(null)
      })
      markersAll.forEach((marker)=>{
        marker.setMap(map)
      })
    })*/
  }


  const addMarkersFiltered = (filterQuery, map) => {
    markersAll.forEach((marker) => {
        marker.setMap(null)
    })
    const markersFiltered = markersAll.filter(({ customInfo }) => {
        return customInfo.find((item) => item === filterQuery)
    })
    markersFiltered.forEach((marker) => {
        marker.setMap(map)
    })
}

const fetchMarkers = async (map) =>{
  try{
    const response = await fetch('http://localhost:3000/markers');
    const json = await response.json();
    console.log(json)
    console.log (response)
    json.forEach(marker => addMarker(map, marker))
  }catch(error){
    console.log(error)
  }
}

const addMarker = (map, marker) =>{
  const {id, nombre, date, descripcion, lat, lng, type} = marker
  //TODO: Aca vamos agregar la informacion

  const markerItem = new google.maps.Marker(
    {
      position: {lat: parseFloat(lat), lng: parseFloat(lng)},
      map: map,
      customInfo: type,
    }
  )
  markerItem.setMap(map)
  markersAll.push(markerItem)


  const contentString = `
  <div class="info_wrapper">
    <h2>${nombre}</h2>
    <h3>${date}</h3>
    <p>${descripcion}</p>
  </div>
  `

  infoWindow = new google.maps.InfoWindow({
    content: contentString
  })

  markerItem.addListener('click', ()=>{
    if(infoWindow){
      infoWindow.close();
    }
    infoWindow.open(map, markerItem)
  })

}

//Formulario

$(document).ready(function() {
  console.log( "ready!" );

  $( "#main_form" ).validate({
      rules: {
          "nombre": {
              required: true,
              minlength: 2,
              maxlength: 10
          },
          "date":{
              required: true
          },
          "type":{
            required: true
          },
          "lat":{
              required: true
          },
          "lng":{
              required: true
          },
          "descripcion": {
              required: true
          },
      },
      messages:{
          "nombre": "Ingresa el nombre del lugar",
          "date": "Ingresa una fecha",
          "lat": "Ingresa una latitud validad",
          "lng": "Ingresa una longitud valida",
          "descripcion": "Ingresa una descripcion"
      },
      submitHandler: function(form){
          //$(form).submit();

          $.ajax({
              url: form.action,
              type: form.method,
              data: $(form).serialize(),
              beforeSend: function(){
                  $('.respuesta_form').html('Espera...')
              },
              success: function(response){
                  console.log(response)
                  $('.respuesta_form').show();
                  $('.respuesta_form').html('Gracias por colocar un nuevo lugar en nuestro mapa');
                  $('.listado').html(' ');
                  getListItems();
              }
          })
      }
    });

    $( "#edit_form" ).validate({
      rules: {
          "nombre": {
              required: true,
              minlength: 2,
              maxlength: 10
          },
          "date":{
              required: true
          },
          "type":{
            required: true
          },
          "lat":{
              required: true
          },
          "lng":{
              required: true
          },
          "descripcion": {
              required: true
          },
      },
      messages:{
          "nombre": "Ingresa el nombre del lugar",
          "date": "Ingresa una fecha",
          "lat": "Ingresa una latitud validad",
          "lng": "Ingresa una longitud valida",
          "descripcion": "Ingresa una descripcion"
      },
      submitHandler: function(form){
          const id = $(form).find('input[name="_id]').val()
          updateItem(id, $(form).serialize())
      }
    });

  
  const deleteItem = async (id) =>{
    try {
      const response = await fetch(`http://localhost:3000/markers/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      getListItems();
    } catch (error) {
      
    }
  }

  const fillForm = async id => {
    try {
        const response = await fetch(`http://localhost:3000/marker/${id}`)
        const data = await response.json()
        const inputs = document.querySelector("#form_edit").elements;
        inputs["nombre"].value = data.nombre;
        inputs["descripcion"].value = data.descripcion;
        inputs["lat"].value = data.lat;
        inputs["lng"].value = data.lng;
        inputs["type"].value = data.type;
        inputs["_id"].value = data._id;
    } catch (error) {
        console.log(error)
    }
}

  const updateItem = async (id, data) => {
    try {
      const response = await fetch(`http://localhost:3000/markers/${id}`, {
        method: 'PUT',
        headers: new Headers({'content-type': 'application/x-www-form-urlencoded'}),
        body: data
      })
        const dataUpdated = await response.json()
        getListItems();
        console.log(dataUpdated)
    } catch (error) {
        console.log(error)
    }
}

  const Item = props => {
    const { _id, nombre, descripcion, lat, lng, type } = props
    return (
        `
        <li class="item">
            <p class="elementonombre">${nombre}</p>
            <a data-id=${_id} class="edit"><img class="imgeditar" src="assets/img/editar.png"></a>
            <a data-id=${_id} class="delete"><img class="imgeditar" id="cruz" src="assets/img/cerrar.png"></a>
        </li>
    `
    )
}

  const $list = document.querySelector('.listado')
  
  const getListItems = async () =>{
    $list.innerHTML = null
    try{
      const response = await fetch(`http://localhost:3000/markers`)
      const items = await response.json();

      items.forEach((item) =>{
        $list.innerHTML += Item(item)
      })

      const $editButtons = document.querySelectorAll('.edit')
      $editButtons.forEach(el =>{
        el.addEventListener('click', (e)=>{
          e.preventDefault();
          console.log(el.dataset.id)
        })
      })

      const $deleteButtons = document.querySelectorAll('.delete')
      $deleteButtons.forEach(el =>{
        el.addEventListener('click', (e)=>{
          e.preventDefault();
          console.log(el.dataset.id)
          deleteItem(el.dataset.id)
        })
      })

    }catch(error){
      console.log(error)
    }
  }
  getListItems();
});

if(document.getElementById("btnModal")){
  var modal = document.getElementById("tvesModal");
  var btn = document.getElementById("btnModal");
  var span = document.getElementsByClassName("close")[0];
  var body = document.getElementsByTagName("body")[0];

  btn.onclick = function() {
    modal.style.display = "block";

    body.style.position = "static";
    body.style.height = "100%";
    body.style.overflow = "hidden";
  }

  span.onclick = function() {
    modal.style.display = "none";

    body.style.position = "inherit";
    body.style.height = "auto";
    body.style.overflow = "visible";
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";

      body.style.position = "inherit";
      body.style.height = "auto";
      body.style.overflow = "visible";
    }
  }
}
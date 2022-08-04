// Define UI Vars
const heading = document.querySelector('.blog-heading')
const search = document.querySelector('.search-panel')
const searchScope = document.querySelector('.searchOp')
const checkbox = document.querySelector('.anonymous');
const details = document.querySelector('.details');
const submitBtn = document.querySelector('.comment_btn');



function hasClass(el, className) {
    if (el.classList)
      return el.classList.contains(className)
    else
      return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
  }
  
  function addClass(el, className) {
    if (el.classList)
      el.classList.add(className)
    else if (!hasClass(el, className)) el.className += " " + className
  }
  
  function removeClass(el, className) {
    if (el.classList)
      el.classList.remove(className)
    else if (hasClass(el, className)) {
      var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
      el.className=el.className.replace(reg, ' ')
    }
  }

  // search Input call
  if(searchScope) {
  searchScope.addEventListener("click",() => {
         if(hasClass(searchScope, "search-scope") ){
            removeClass(searchScope, "search-scope")
            removeClass(searchScope, "fas")
            removeClass(searchScope, "fa-search")
            removeClass(searchScope, "fa-stack-1x")
            heading.style.display = 'none';
            search.style.display = 'block';
            addClass(searchScope,"cancel-scope" )
            addClass(searchScope,"fas" )
            addClass(searchScope,"fa-times" )
            addClass(searchScope,"fa-stack-2x" )
         } 
         else {
            removeClass(searchScope, "cancel-scope")
            removeClass(searchScope, "fas")
            removeClass(searchScope, "fa-times")
            removeClass(searchScope, "fa-stack-2x")
            heading.style.display = 'block';
            search.style.display = 'none';
            addClass(searchScope,"search-scope" )  
            addClass(searchScope,"fas" )   
            addClass(searchScope,"fa-search" )   
            addClass(searchScope,"fa-stack-1x" )   
         }
});
} else {
  console.log('no search input');
}

// Anonymous checkbox 
   if(checkbox) {
     checkbox.addEventListener('click', () => {
      if(checkbox.checked == true) {
        details.style.display = "none";
      } else {
        details.style.display = "block";
      }
     })
   }else {
     console.log('no checkbox');
   }
  


// Submitting comment
if(submitBtn) {
  submitBtn.addEventListener('click', (e) => {
    e.preventDefault()

    if(checkbox.checked) {
      const id = document.getElementById('id');
      const comment = document.getElementById('comment');
      let alert =  document.querySelector('.error');
      let success = document.querySelector('.success');
      const fName = 'Anonymous'

      const dComment = comment.value
      const postId = id.value

      fetch('/post/:id/comment', {
        method: 'POST',
        headers: new Headers({"Content-Type": "application/json"}),
        body:JSON.stringify({postId, fName, dComment})
      })
      .then(response => {
        if(response.status == 200) {
          success.style.display = 'block'

          setTimeout(() => {
            success.style.display = 'none';
          }, 8000);
        } else {
          alert.innerHTML = '<h6>Something went wrong, try again later</h6>'
          alert.style.display = 'block'

          setTimeout(() => {
            alert.style.display = 'none';
          }, 8000);
        }
      })
      .catch((err) => {
        alert.innerHTML = `Error ${err}`
        alert.style.display = 'block'

          setTimeout(() => {
            alert.style.display = 'none';
          }, 8000);
      })
      

      comment.value = '';

    } 
    else {
      const fName = document.getElementById('FName');
      const cEmail = document.getElementById('cEmail');
      const comment = document.getElementById('comment');
      const id = document.getElementById('id');

      let alert =  document.querySelector('.error');
      let success = document.querySelector('.success');
      if( fName.value == ''){
        alert.innerHTML = '<h6>Enter your Full Name</h6>'
        alert.style.display ='block'
      } else if (cEmail.value == '') {
        alert.innerHTML = '<h6>Enter your Email Address</h6>'
        alert.style.display = 'block'
      } else if (comment.value ==  '') {
        alert.innerHTML = '<h6>Write a comment</h6>'
        alert.style.display = 'block'
      } else {
       alert.style.display = 'none';

       const name = fName.value
       const email = cEmail.value
       const dComment = comment.value
       const postId = id.value

      fetch('/post/:id/comment', {
        method: 'POST',
        headers: new Headers({"Content-Type": "application/json"}),
        body:JSON.stringify({postId, name, email, dComment})
      })
      .then(response => {
        if(response.status == 200) {
          success.style.display = 'block'

          setTimeout(() => {
            success.style.display = 'none';
          }, 8000);
        } else {
          alert.innerHTML = '<h6>Something went wrong, try again later</h6>'
          alert.style.display = 'block'

          setTimeout(() => {
            alert.style.display = 'none';
          }, 8000);
        }
      })
      .catch((err) => {
        alert.innerHTML = `Error ${err}`
        alert.style.display = 'block'

          setTimeout(() => {
            alert.style.display = 'none';
          }, 8000);
      })


       fName.value = '';
       cEmail.value = '';
       comment.value = '';


      }
      
    }
  
  })
} else {
  console.log('no submit btn');
}


 
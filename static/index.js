
const heading = document.querySelector('.blog-heading')
const search = document.querySelector('.search-panel')
const searchScope = document.getElementById('search-options')

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


  searchScope.addEventListener("click", () => {

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

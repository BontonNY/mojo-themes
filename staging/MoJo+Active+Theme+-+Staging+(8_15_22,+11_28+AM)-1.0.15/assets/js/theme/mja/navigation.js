export default function navigation() {
  $(document).on('click', ".nav-primary  span.more, .nav-primary .nav-link.level-0, .nav-primary .float-to-right.active ul.level-1 a.nav-link", function (e) {
    if (window.innerWidth <= 1199) { 
      e.preventDefault();
      $(this).toggleClass("active");
      $(this).closest('li').find(' .float-to-right:first').addClass('active');
      let backLinkText= 'Back';

      if($(this).closest('ul').hasClass('level-0')){
        backLinkText= 'Main Menu';
      }

      if($(this).closest('ul').hasClass('level-1')){
        backLinkText=  $(this).closest('.nav-item.has-submenu').find('a:first').data('label');
      }

      if(!($(this).closest('li').find(' .float-to-right:first .back-to-link').length)){
        let t = `
          <div class="d-flex justify-content-between levels-top">
            <div>
              <form class="form" action="/search.php">
                <fieldset class="d-flex px-0 px-xl-0">
                    <legend class="sr-only">Site Search</legend>
                    <div class="d-flex w-100 search-box-wrapper">
                        <label class="sr-only" for="search_query">Search</label>
                        <input class="form-control px-4 pr-6 small" data-search-quick="" name="search_query" placeholder="Search" autocomplete="off">
                        <button class="d-none btnIconSearch"><i class="fa fa-search"></i></button>
                        <button class="search-btn ml-2 px-3 px-lg-2" type="submit"><i class="far fa-search d-inline mr-lg-2"></i></button>
                    </div>
                </fieldset>
                <div class="dropdown dropdown--quickSearch quickSearchResults" aria-hidden="true" tabindex="-1" data-prevent-quick-search-close="">
                    
                </div>
              </form>
            </div>
            <i class="fal fa-times fa-x-2"></i>
          </div>
          <a href="#" class="back-to-link">
          <span class="fal fa-long-arrow-left"></span>
          ${backLinkText}
          </a>

          <hr>
          <strong>${$(this).closest('a').html()}</strong>           
        `;

        $(this).closest('li').find(' .float-to-right:first').prepend(t);
      }
      
    }
  });


  $(document).on('click', '.back-to-link, .levels-top i', function(){
    $(this).closest('.float-to-right').removeClass('active');
  })

  $(document).on('click', '.back-to-level0', function(){
    $('.level-1-active.active').removeClass('active');
  });


  $(".nav-link--quickSearch").click(function () {
    if (window.innerWidth <= 992) {
      $("html,body").animate({ scrollTop: $(".dropdown--quickSearch").offset().top -30 }, 500);
    }
  });
 
 

  $(document).on('click','[data-target="#primaryNavBar"]', function(){
    $('body').toggleClass('overflow-hidden');
  });



}


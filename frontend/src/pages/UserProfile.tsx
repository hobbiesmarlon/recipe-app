import React, { useState } from 'react';
import { Link } from 'react-router';
import BottomNav from '../components/BottomNav';
import { PageContainer } from '../components/PageContainer';

const UserProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('myrecipes');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const tabs = ['myrecipes', 'savedrecipes', 'history'];
  
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    const currentIndex = tabs.indexOf(activeTab);
    
    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
    if (isRightSwipe && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="py-4 sticky top-0 z-10 bg-background-light dark:bg-background-dark">
        <PageContainer>
          <div className="flex items-center justify-between">
            <div className="w-10"></div>
            <h1 className="text-lg font-bold text-background-dark dark:text-background-light">Profile</h1>
            
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="More options"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>

              {isMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsMenuOpen(false)} 
                  />
                  <div className="absolute right-0 top-full mt-2 w-52 z-20 rounded-2xl bg-surface-light dark:bg-surface-dark shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden animate-fadeIn">
                    <div className="flex flex-col py-2">
                      <Link 
                        to="/edit-profile" 
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-text-light dark:text-text-dark hover:bg-primary/10 dark:hover:bg-white/5 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        Edit Profile
                      </Link>
                      <Link 
                        to="/my-recipes" 
                        className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-text-light dark:text-text-dark hover:bg-primary/10 dark:hover:bg-white/5 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
                        </svg>
                        My Recipes
                      </Link>
                      <div className="mx-2 my-1 border-t border-border-light dark:border-border-dark" />
                      <button 
                        id="shareProfileBtn"
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-text-light dark:text-text-dark hover:bg-primary/10 dark:hover:bg-white/5 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                        </svg>
                        Share Profile
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </PageContainer>
      </header>
      
      <main className="pb-24">
        <PageContainer className="space-y-6 pt-6">
          <div className="@container">
            <div className="flex w-full flex-col items-center gap-6">
              <div className="flex flex-col items-center gap-4">
                <div className="h-32 w-32 shrink-0">
                  <img alt="Sophia Bennett's profile picture" className="h-full w-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjF4IBYL2qx1Zz4w-VTiBqLPNeVqbYwLgBfCV_nyEnVAYQ57EGsWmQxIAEFyxmKUgxZDvTyP1w3ynm3A6vF-JGJiRePgFl7mSFANWm_Eu466ilLKDuUihdjuq9pMulKbmP6IsYggE36Y2mYNUdf26X5ZTtjpCwZLLCDef9Do_q3pTY5V3L9u83qxWm05rKI21XfD1Kp0jT0wqiVSAJwvwwO0ITRbFXjFNoTi5bO11kmpK2qpvIWUIYdt00Xba3Wp4ljEYhZmZUxmk" />
                </div>
                <div className="flex flex-col items-center">
                  <p className="text-[22px] font-bold text-background-dark dark:text-background-light">Sophia Bennett</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-base text-primary">@sophia_b</p>
                    <svg className="h-3.5 w-3.5 text-background-dark dark:text-background-light" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.494h2.039L6.486 3.24H4.298l13.311 17.407z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-primary/20 dark:border-primary/30">
            <nav className="flex justify-center gap-8 px-4" role="tablist" aria-label="Profile tabs">
              <button 
                onClick={() => setActiveTab('myrecipes')}
                className={`flex flex-col items-center border-b-2 pb-3 pt-4 text-sm font-bold transition-colors ${activeTab === 'myrecipes' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
              >
                My Recipes
              </button>
              <button 
                onClick={() => setActiveTab('savedrecipes')}
                className={`flex flex-col items-center border-b-2 pb-3 pt-4 text-sm font-bold transition-colors ${activeTab === 'savedrecipes' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
              >
                Saved Recipes
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex flex-col items-center border-b-2 pb-3 pt-4 text-sm font-bold transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-gray-500 dark:text-gray-400'}`}
              >
                History
              </button>
            </nav>
          </div>

          <div 
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="min-h-[300px]"
          >
            {activeTab === 'myrecipes' && (
              <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                <div className="flex flex-col gap-3">
                  <div className="aspect-square w-full overflow-hidden rounded-lg">
                    <img alt="Breakfast Ideas" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3VAhvxDsk0s_zP5LK4UULTnmbF0PVt6bzCbDlIzDFEDH8NcX48UcH9p3btzkM3rRDFh28RZC2yIg2xacHF1V-5vldpucjt2L4a8inoIg8RRBUd-5852QGPy3EbCzucSmMXIL9MR2Z2GG76Rpi2ep2uL1rrfwjKFr2DGEVoY99uoSL_k6FSGjtQ-7G-MndmwsHtLKblOPCJk1HpSdHyWLAjjPgX1SDWOWY7q3W7UZJPKPR-rUpUhouu_uXpEH5yvr0QvrzGf8HvrI" />
                  </div>
                  <p className="font-medium text-background-dark dark:text-background-light">Breakfast Ideas</p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="aspect-square w-full overflow-hidden rounded-lg">
                    <img alt="Quick Dinners" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGuWoHpRwfw07lzD-OOW6f7WcXSj0qn0rVEWOM25qO9x2BLMFSsftZf48-41-_7bfrEwu1NE-W7OHY0brgo30Ynx1UXypwDuxdCryigzmTSn13K7pChFkEbm1SYQPtRYXjxVeUXJInf1sK5KB5vp-sIbb6fX6nykWD5NBwlvjhrqPFDuZqT-War-AZMEfx4R4P7nwLPyfJUP6QOY1l7ofErS5iOj_CEyx83WHtBmgrTsWN3EugaHavO1y3l_-EGwj3i6NJXLvnM_8" />
                  </div>
                  <p className="font-medium text-background-dark dark:text-background-light">Quick Dinners</p>
                </div>
              </div>
            )}

            {activeTab === 'savedrecipes' && (
              <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                <div className="flex flex-col gap-3">
                  <div className="aspect-square w-full overflow-hidden rounded-lg">
                    <img alt="Dessert Recipes" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx3yKlGt_-Bpss7n-SLsrf3tWBugu7TpUyLtV1b_0ed51F3QLAGjekwbn7UPBfKjPDl5lNnQV8-CTBbbMtMs51esPYn_ESsqRLdMHJVX5vV2TqRxyHuGTSjpzUMa91x7S7ys0-5-tp8h8rAMIHB8reHc9jNCqzIUipe0BZ_zZ7Vs20fSVXOy_ePowXFqwXesMXil9KHE-WwXy-xM67N39qRcMxyB1waQOZQfeoRn3dgXupREq1LiipHTnCKNqvtCKCB2K6OIrs9B4" />
                  </div>
                  <p className="font-medium text-background-dark dark:text-background-light">Dessert Recipes</p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="aspect-square w-full overflow-hidden rounded-lg">
                    <img alt="Avocado Toast" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjF4IBYL2qx1Zz4w-VTiBqLPNeVqbYwLgBfCV_nyEnVAYQ57EGsWmQxIAEFyxmKUgxZDvTyP1w3ynm3A6vF-JGJiRePgFl7mSFANWm_Eu466ilLKDuUihdjuq9pMulKbmP6IsYggE36Y2mYNUdf26X5ZTtjpCwZLLCDef9Do_q3pTY5V3L9u83qxWm05rKI21XfD1Kp0jT0wqiVSAJwvwwO0ITRbFXjFNoTi5bO11kmpK2qpvIWUIYdt00Xba3Wp4ljEYhZmZUxmk" />
                  </div>
                  <p className="font-medium text-background-dark dark:text-background-light">Avocado Toast</p>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
               <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                <div className="flex flex-col gap-3">
                  <div className="aspect-square w-full overflow-hidden rounded-lg">
                    <img className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUf9SIcOlc-L412hId07kkGkX67aekRdlwQkyyJqDBITii3OWnwf-Mvyk_nlHfW2lxWU_YXPwSQida_6ZrXZ73-wDJp-tXFWKibqWUgiMhHxiBvg0gjevlbuBhftRr0vPd-HtPzhbzFwGpHPZvuMkO0xqr6MrcF2eXBTCZIVsBkE_yTXExNMVE0NfSOUh6DEr9lelhRKQwea89u6WG2D042pM6PYbKACprhmbphSZkPmP4v6Cxh_cX2UZsULeIROoMEQBj9yyi7SqH" alt="item" />
                  </div>
                  <p className="font-medium text-background-dark dark:text-background-light">Spicy Thai Basil Chicken</p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="aspect-square w-full overflow-hidden rounded-lg">
                    <img className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJMNTg46lYe9RwxB6FjvAgzEa4LBvEOfIx-MvnGvPVytlIgFqyzEGECyho2VOUX_r7m9Bohmj6hE9_LhFdzxOMQ-4ENj9S3szemLxbDKY0h3Y0TR4hcinvXpwEt74MWslA3fXkWwm0o773DrORrwZMuJK4qhZH3HfqzNU0sDBHdg50jc98uiSjLTyE7L2BDJiXNIqekSr3yBXyxVcFmmi1GiGgjYx2fg0EqFbwBcDas8oVxfZsQGGZajweSXH4D0_XrBvDhDi1UsVf" alt="item" />
                  </div>
                  <p className="font-medium text-background-dark dark:text-background-light">Creamy Tomato Pasta</p>
                </div>
              </div>
            )}
          </div>
        </PageContainer>
      </main>

      <BottomNav />
    </div>
  );
};

export default UserProfile;
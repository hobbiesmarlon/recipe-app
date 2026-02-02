import React from 'react';
import BottomNav from '../components/BottomNav';
import { PageContainer } from '../components/PageContainer';

const Categories: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="py-4 md:py-0 sticky top-0 md:top-14 z-10 bg-background-light dark:bg-background-dark md:bg-transparent">
        <PageContainer>
          <div className="flex items-center justify-between md:hidden">
            <div className="w-6"></div>
            <h1 className="text-lg font-bold">Categories</h1>
            <div className="w-10"></div>
          </div>
        </PageContainer>
      </header>

      <main className="pb-24">
        <PageContainer className="space-y-8 pt-6 md:pt-4">
          <section className="md:w-fit md:mx-auto">
            <h2 className="text-2xl font-bold">Meals</h2>
            <div className="mt-3 flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:overflow-visible no-scrollbar">
              <div className="w-40 flex-shrink-0 space-y-2">
                <div className="aspect-square w-full rounded-xl bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDjoelberBs8Fo3VSD3DmAY49iH4_t2Knn-KuV1lksyOnrRWky0p_-PGB_YyKE4WqghpElvpDa_DXlM51A4yLlBJ8cUZ6AF2oC3FIWsQy6RYNaxDVmc5effPsWSqc6ExEcyy3aKTvoDjjtmbAr2o2HWxBtl1eG5ODqMn24zBUq0zEDe9BvtYbKrHm1BHmhacPIVXWlDm-h6NlB5IlKry6DoHhplqPdMl7hg00qhk7ykVj6Iuh2lYAsiZKRsfX-GmYWzdFKaOBsId-s")' }}></div>
                <p className="text-sm font-medium">Pasta Perfection</p>
              </div>
              <div className="w-40 flex-shrink-0 space-y-2">
                <div className="aspect-square w-full rounded-xl bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCAq8PcmypVd9IYAG12BH1YMNSbD-fVYkXwqQ8GZMWK150uBlOUduwxyzb_c1mdQazi66F3k1GrICsI7XPs7jINIEQJ-z9nYbCWCV53yGtF3rep85swuXp_OwXSlEEGQe75mdsi27PCotPeNq8qYbyHWCX5Y5JVl8TsQmgwyxhc2M6eSVXMvsZR-hP1C--_H0i0VeQNd1qGew_AkcSCizC57EcGGie-7iaQch4OxoOt8KxQVx4TQRnBXp8rbjIUGx8zEblcdOWyCcY")' }}></div>
                <p className="text-sm font-medium">Asian Delights</p>
              </div>
              <div className="w-40 flex-shrink-0 space-y-2">
                <div className="aspect-square w-full rounded-xl bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuANOHjQx8va6piCmwC0uHa6jMwMZuZ72kga8deZYIWAz5LhgttIDLBcWEex-WlrK0oGiHGpk-vpeJ9B3VzTsv1GNatn5BokWIf2WFgTLlNhswOVVpqsgowokSCFpTveRyOoHYbz0TghJ1b14XMWYYJTFH6t0ansdz7Y_RnIijyFa3yoy29pXT8i6Is9sTs0siXo22KxplqX0zJqP0X2qCQRQAoZdIttTB2Wy6WFBEoVVBXGhMQoKn2bb15El5vzESsG0yTR59IQZdc")' }}></div>
                <p className="text-sm font-medium">Seafood Sensations</p>
              </div>
            </div>
          </section>
          <section className="md:w-fit md:mx-auto">
            <h2 className="text-2xl font-bold">Desserts</h2>
            <div className="mt-3 flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:overflow-visible no-scrollbar">
              <div className="w-40 flex-shrink-0 space-y-2">
                <div className="aspect-square w-full rounded-xl bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCeNS3P0mRNoo9NUJpQlyi_fdFSh9Hs8ZCJj5L3A95KVT2JkYBNt6If3-i561Oe1LSAmUqD2SMQn10LrfNJ95lT5g5XEtxDoxtlgx673eY7ibE32ZtV_AjMv8YSTe7gTk6JVOen_RgoTStjYgc8YKuX91qQBX0YjuCdPB6s5dqpNnaf2M26qtHUUFh1PfYN9esFTxM7uKnbRe07p_oxisLElrhzqs38iSoPbK9BYxNKtKTS8S52YI3rv8fQJF7whenv3SqeyG2ScJM")' }}></div>
                <p className="text-sm font-medium">Chocolate Indulgence</p>
              </div>
              <div className="w-40 flex-shrink-0 space-y-2">
                <div className="aspect-square w-full rounded-xl bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB2JPdayOYnHhnswDTtIYM_MgxIX15pETas7cWb3xEvcCb4dGMFvvHDYedWUhQQ8y_ZsBeoN-tYiVZO4ulGBwoHKGGnyF1ixJ8SuZjoPETzqz5bfNe_1VeMEo7PAlow6VQ0SdpvpS6e3L9Yo1t1VoPFFUxBFaD0Q8i4CwngCuAe3fG1ziXYkm2YuBG8slTBhTaka6dfN4jW5nlxdQn4ORXP02Qs-mCkkKn0akEEzSfZ2oEuR0Y7R89KYCgQkguaZiqRUoGkVnIVbdw")' }}></div>
                <p className="text-sm font-medium">Fruity Freshness</p>
              </div>
              <div className="w-40 flex-shrink-0 space-y-2">
                <div className="aspect-square w-full rounded-xl bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC3a4BYtD7np2rprMbEmAU30KmFKlFPHoxbh0zPvdDyVhAOTBAPW6kUL4l7-ZZnDS-rhF6YZnCnHlpGXAwLpQCNWlXvfsyEIhU04maR7KqDwWO4VLpwYQDkqSZ94IoSlnU4EwK7sviZ7UXMTsgCpLB4qkEZDHmbaFCmKNTCgAjjRBllMG-S3JThg3-vef02JyIzQXyY5dfohlARNg9vBIXaDeiLVRdXCjLdJhW0xJiSWHDL0laCXg6fbQBvn_mLp9DGL58Ll874uLs")' }}></div>
                <p className="text-sm font-medium">Frozen Treats</p>
              </div>
            </div>
          </section>
          <section className="md:w-fit md:mx-auto">
            <h2 className="text-2xl font-bold">Baking</h2>
            <div className="mt-3 flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:overflow-visible no-scrollbar">
              <div className="w-40 flex-shrink-0 space-y-2">
                <div className="aspect-square w-full rounded-xl bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB84xw7t8VgGsjH2ZIllKa0TLFvcfg7dcmiuZHJtAaZ76jUEfuqOgDdqC33X_CLtJh8HblfxWjONkshmXP0gf2tww8Oepg-Y22rCxGI9zHgmj7KAS5kCKns5DE7Ai_EEI3Vrs7J0z8ZFLB3E_UlNuBk6PVhYyheywqNEBhzD-eK42st44ooagR5erLiyWtzCILI04tKSBup5ZqEu6HKyYTTNdG4j_xWu8xPcqwQ-ecI_3gf2GEFos1x1yJOU4zR8KoXP_rWvSjqzxY")' }}></div>
                <p className="text-sm font-medium">Homemade Breads</p>
              </div>
              <div className="w-40 flex-shrink-0 space-y-2">
                <div className="aspect-square w-full rounded-xl bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBbZHrCtcOj4M79bzkftochqnq1jFZUixf0Pf90wvUO2zzgi98RrtMIqIutd_rbbIFXvknvjnv9wOBbM7l0ZiS5ORVLgbzbxqHAuaNueQ5SFjL0Qlcgci8acjLda1RwvzvH0QD62HFs_onfKuaDI0p3rYYqKwW9gzC_1_L1bkfPiwnSoDLHLwbyTr-nJK4XxcCwJPp3Qb0u6c0P_mOdpT1C2ZK_vc6Rr6bV4G7sRohGbx7kQdyd3u5yLM492P_T5E4fv8koixIe1j0")' }}></div>
                <p className="text-sm font-medium">Cookie Creations</p>
              </div>
              <div className="w-40 flex-shrink-0 space-y-2">
                <div className="aspect-square w-full rounded-xl bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC1V4MglmPKFWtcoMWz61ybjmkk9y1BnCCbFaUxxK3-zc5wsO7H2I_UP2d8yqwMCrMcdAXJshXmpfRdhbK3wEbQMrjNiQlUmKls3vt3p7RP3-_nwEnLqWTGcHxJxoZEFoeilD8ERQpIgMNmgtwMf6D3_eV9N-3ro8li5Nl4H-iElTH5cEiOZFlvuJvwm0fsFzypdD9DxyOBHTJYntN_blERWDd9DTZirRSAEqtLNVvLD1Ld6TQoyyWDu_EGc8qjJcjQLzsGBDY927k")' }}></div>
                <p className="text-sm font-medium">Morning Muffins</p>
              </div>
            </div>
          </section>
        </PageContainer>
      </main>

      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default Categories;
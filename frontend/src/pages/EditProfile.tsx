import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string>('https://lh3.googleusercontent.com/aida-public/AB6AXuBjF4IBYL2qx1Zz4w-VTiBqLPNeVqbYwLgBfCV_nyEnVAYQ57EGsWmQxIAEFyxmKUgxZDvTyP1w3ynm3A6vF-JGJiRePgFl7mSFANWm_Eu466ilLKDuUihdjuq9pMulKbmP6IsYggE36Y2mYNUdf26X5ZTtjpCwZLLCDef9Do_q3pTY5V3L9u83qxWm05rKI21XfD1Kp0jT0wqiVSAJwvwwO0ITRbFXjFNoTi5bO11kmpK2qpvIWUIYdt00Xba3Wp4ljEYhZmZUxmk');
  const [displayName, setDisplayName] = useState('Sophia Bennett');
  const [username, setUsername] = useState('sophia_b');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setPhoto(url);
    }
  };

  const handleSave = () => {
    alert('Saved (mock). In a real app this would POST to the server.');
    navigate('/profile');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <header className="py-4 sticky top-0 z-10 bg-background-light dark:bg-background-dark border-b border-border-light dark:border-border-dark">
        <div className="mx-auto max-w-2xl px-4 flex items-center justify-between relative">
          <Link to="/profile" className="flex items-center gap-3 text-primary z-20">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/></svg>
          </Link>
          <span className="font-bold text-black dark:text-white absolute left-0 right-0 text-center pointer-events-none">Edit Profile</span>
          <div className="w-6"></div>
        </div>
      </header>

      <main className="px-4 space-y-6 mx-auto max-w-2xl pb-32">
        <section className="pt-6">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-primary font-medium leading-relaxed">
              <span className="font-bold">Note:</span> If you signed up with X or Facebook, your display name and username are synced with your social account and cannot be edited here.
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div id="photoPreview" className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img id="photoImg" src={photo} alt="Profile photo" className="h-full w-full object-cover" />
              </div>
              <label htmlFor="photoInput" className="absolute -bottom-1 -right-1 inline-flex items-center gap-2 rounded-full bg-white/90 dark:bg-background-dark/80 p-1 shadow cursor-pointer">
                <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a5 5 0 00-5 5v1H5a3 3 0 00-3 3v6a3 3 0 003 3h14a3 3 0 003-3v-6a3 3 0 00-3-3h-2V7a5 5 0 00-5-5z"/></svg>
                <input id="photoInput" type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
              </label>
            </div>

            <div className="text-center">
              <p className="text-lg font-bold text-background-dark dark:text-background-light">{displayName || 'Your name'}</p>
              <p className="text-sm text-primary">@{username || 'username'}</p>
            </div>
          </div>
        </section>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-background-dark dark:text-background-light">Display name</label>
            <input 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 py-3 focus:ring-primary focus:border-primary" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-background-dark dark:text-background-light">Username</label>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-primary font-bold">@</span>
              <input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 block rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark px-3 py-3 focus:ring-primary focus:border-primary" 
              />
            </div>
            <p className="mt-2 text-xs text-text-muted-dark dark:text-text-muted-light">Your public handle. Letters, numbers, underscores allowed.</p>
          </div>
        </form>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark pb-safe">
        <nav className="mx-auto max-w-2xl flex h-20 items-center justify-between px-4">
          <button onClick={() => navigate('/profile')} className="rounded-xl bg-white/80 dark:bg-gray-800 px-6 py-3 text-sm font-medium text-primary border border-primary/10 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button onClick={handleSave} className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-orange-600 shadow-lg shadow-primary/20 transition-all active:scale-95">Save Changes</button>
        </nav>
      </footer>
    </div>
  );
};

export default EditProfile;

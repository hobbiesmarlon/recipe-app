import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '../store/useAuthStore';
import client from '../api/client';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuthStore();
  
  const [photo, setPhoto] = useState<string>('https://via.placeholder.com/150');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setPhoto(user.profile_picture_url || 'https://via.placeholder.com/150');
      setDisplayName(user.display_name);
      setUsername(user.username);
    }
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPG, JPEG, or PNG).');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPhoto(url);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let finalProfilePicUrl = user?.profile_picture_url;

      // 1. Upload photo if selected
      if (selectedFile) {
        // Get presigned URL
        const presignedRes = await client.post('/users/me/profile-picture-upload-url', {
          file_type: selectedFile.type
        });
        const { url, fields, public_url } = presignedRes.data;

        // Upload to S3/MinIO
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) => {
          formData.append(key, value as string);
        });
        formData.append('file', selectedFile);

        await fetch(url, {
          method: 'POST',
          body: formData,
        });

        finalProfilePicUrl = public_url;
      }

      // 2. Update user profile
      await client.patch('/users/me', {
        display_name: displayName,
        username: username,
        profile_picture_url: finalProfilePicUrl
      });

      // 3. Refresh user store
      await fetchUser();
      
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
      <header className="py-4 sticky top-0 md:top-14 z-10 bg-background-light dark:bg-background-dark">
        <div className="mx-auto max-w-2xl px-4 flex items-center justify-between relative">
          <Link to="/profile" className="flex items-center gap-3 text-primary z-20 md:-ml-8 lg:hidden">
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"/></svg>
          </Link>
          <span className="font-bold text-black dark:text-white absolute left-0 right-0 text-center pointer-events-none">Edit Profile</span>
          <div className="w-6"></div>
        </div>
      </header>

      <main className="px-4 space-y-6 mx-auto max-w-2xl flex-grow">
        <section className="pt-6">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-primary font-medium leading-relaxed">
              <span className="font-bold">Note:</span> {user?.username_sourced_from_provider 
                ? "Your details are synced with X and cannot be edited here."
                : "Since you signed in with Google, you can customize your profile details below."}
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div id="photoPreview" className="h-32 w-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img id="photoImg" src={photo} alt="Profile photo" className="h-full w-full object-cover" />
              </div>
              {!user?.profile_pic_sourced_from_provider && (
                <label htmlFor="photoInput" className="absolute -bottom-1 -right-1 inline-flex items-center gap-2 rounded-full bg-white/90 dark:bg-background-dark/80 p-2 shadow cursor-pointer border border-primary/10">
                  <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                    <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM192,104,152,64l24-24,40,40Z"></path>
                  </svg>
                  <input id="photoInput" type="file" accept=".jpg,.jpeg,.png" className="sr-only" onChange={handlePhotoChange} />
                </label>
              )}
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
              disabled={user?.display_name_sourced_from_provider || isLoading}
              className="mt-2 block w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark px-4 py-3 focus:ring-primary focus:border-primary disabled:bg-gray-50 dark:disabled:bg-gray-900 opacity-70" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-background-dark dark:text-background-light">Username</label>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-primary font-bold">@</span>
              <input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                disabled={user?.username_sourced_from_provider || isLoading}
                className="flex-1 block rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark px-3 py-3 focus:ring-primary focus:border-primary disabled:bg-gray-50 dark:disabled:bg-gray-900 opacity-70" 
              />
            </div>
            <p className="mt-2 text-xs text-text-muted-dark dark:text-text-muted-light">Your public handle. Letters, numbers, underscores allowed.</p>
          </div>
        </form>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark pb-safe md:static md:border-none md:mt-10">
        <nav className="mx-auto max-w-2xl flex h-20 items-center justify-between px-4">
          <button onClick={() => navigate('/profile')} disabled={isLoading} className="rounded-xl bg-white/80 dark:bg-gray-800 px-6 py-3 text-sm font-medium text-primary border border-primary/10 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isLoading} className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-orange-600 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </nav>
      </footer>
    </div>
  );
};

export default EditProfile;

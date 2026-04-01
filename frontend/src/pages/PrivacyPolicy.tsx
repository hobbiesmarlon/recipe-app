import React from 'react';
import { PageContainer } from '../components/PageContainer';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen py-12">
      <PageContainer>
        <div className="max-w-3xl mx-auto bg-white dark:bg-card-dark p-8 md:p-12 rounded-2xl shadow-sm border border-border-light dark:border-border-dark">
          <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-text-muted-light dark:text-text-muted-dark leading-relaxed">
            <p>
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-3">1. Introduction</h2>
              <p>
                Welcome to Recipefy. This is a simple hobby project for sharing recipes. We value your privacy and want to be transparent about how we handle your data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-3">2. Information We Collect</h2>
              <p>
                When you use Recipefy, we may collect the following information:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li><strong>Account Information:</strong> If you sign up, we collect your display name, profile picture (if provided), and authentication details via our third-party login providers (like Google or Cognito).</li>
                <li><strong>User Content:</strong> Recipes you upload, including titles, ingredients, instructions, and photos or videos.</li>
                <li><strong>Usage Data:</strong> Basic information about how you interact with the site to help us improve the experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-3">3. How We Use Your Information</h2>
              <p>
                We use your information to:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-2">
                <li>Provide and maintain the service.</li>
                <li>Display your recipes and profile to other users.</li>
                <li>Improve and personalize the app.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-3">4. Data Sharing</h2>
              <p>
                We do not sell your personal data. Your recipes and public profile are visible to other users of the application. We may use third-party services (like AWS for hosting and storage) that process data on our behalf.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-3">5. Data Security</h2>
              <p>
                We take reasonable measures to protect your information, but remember that no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-3">6. Your Choices</h2>
              <p>
                You can update your profile information or delete your recipes at any time through the application interface.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-text-light dark:text-text-dark mb-3">7. Contact Us</h2>
              <p>
                Since this is a hobby project, if you have any questions, please feel free to reach out to us at <a href="mailto:marlonoloo47@gmail.com" className="text-primary hover:underline">marlonoloo47@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default PrivacyPolicy;

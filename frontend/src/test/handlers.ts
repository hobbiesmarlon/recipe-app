import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock current user
  http.get('/api/v1/users/me', () => {
    return HttpResponse.json({
      id: 1,
      username: 'johndoe',
      display_name: 'John Doe',
      profile_picture_url: null,
      username_sourced_from_provider: false,
      display_name_sourced_from_provider: false,
      profile_pic_sourced_from_provider: false
    });
  }),

  // Mock recipe creation
  http.post('/api/v1/recipes/with-media', () => {
    return HttpResponse.json({
      id: 123,
      name: 'Test Recipe',
      media_count: 1
    }, { status: 200 });
  }),

  // Mock presigned posts
  http.post('/api/v1/media/presigned-posts', () => {
    return HttpResponse.json([
      { url: 'http://mock-upload.com', fields: {}, key: 'mock-key' }
    ]);
  })
];

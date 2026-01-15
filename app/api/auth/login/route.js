export async function POST(request) {
    const { email, password } = await request.json();
    
    // Pour tester, on simule une connexion
    if (email === 'admin@care-pilot.fr' && password === 'admin123') {
      return Response.json({ 
        success: true,
        token: 'fake-token-123',
        user: {
          name: 'Admin',
          email: 'admin@care-pilot.fr',
          role: 'admin'
        }
      });
    }
    
    return Response.json({ 
      success: false, 
      message: 'Identifiants incorrects' 
    });
  }
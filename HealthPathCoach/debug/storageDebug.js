// debug/storageDebug.js
import { StorageService } from '../services/authService';

export const debugStorageStatus = async () => {
  try {
    console.log('🔍 Starting storage debug...');
    const storageService = new StorageService();
    const status = await storageService.getStorageStatus();
    
    console.log('📊 Storage Status Report:');
    console.log('  - Initialized:', status.initialized);
    console.log('  - SecureStore:', status.secureStore ? '✅' : '❌');
    console.log('  - AsyncStorage:', status.asyncStorage ? '✅' : '❌');
    console.log('  - MemoryStorage:', status.memoryStorage ? '✅' : '❌');
    console.log('  - Preferred Method:', status.preferredMethod);
    
    return status;
  } catch (error) {
      console.error('❌ Storage debug failed:', error);
      console.log('Debug will retry later...')
    throw error;
    }
    
};
import axios from 'axios';

export async function fonnteSendMessage(deviceToken: string, target: string, message: string): Promise<void> {
  await axios.post(
    'https://api.fonnte.com/send',
    { target, message },
    { headers: { Authorization: deviceToken }, timeout: 15000 },
  );
}

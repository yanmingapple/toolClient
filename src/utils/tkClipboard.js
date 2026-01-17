import clipboard from 'clipboard';
export default class TkClipboard {
  
  copy(data,tipMessage) {
    clipboard.copy(data);
    if(tipMessage)tkMessage.succ(tipMessage,1);
  }
}

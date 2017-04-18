import { 
  Component,
  Input,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';

import { Message } from '../../../model/message.model';
import { MessageService } from '../../../service/message/message.service';

@Component({
  selector: 'wk-chat-area',
  templateUrl: './chat-area.component.html',
  styleUrls: ['./chat-area.component.scss']
})
export class ChatAreaComponent implements OnInit, OnDestroy {

  @ViewChild('chat') private chatContainer: ElementRef;

  messages: Array<Message>;
  private message: Message;
  private connection;

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.messages = [];
    
    this.connection = this.messageService.getMessages().subscribe(message => {
      // Max 500 messages in chat
      if(this.messages.length >= 500) {
        this.messages.shift();
      }
      this.messages.push(message);
      this.scrollBottom();
    });

    this.scrollBottom();
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

  private scrollBottom() {
   try {
      let chat;
      if(this.chatContainer) {
        chat = this.chatContainer.nativeElement;
        chat.scrollTop = chat.scrollHeight;
      }
    } catch(err) {
      console.error(err);
    }
  }

}
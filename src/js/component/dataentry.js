import SendBirdDesk from 'sendbird-desk';
import { simplify } from '../simplify.js';
import { parseDom } from '../domparser.js';
import Spinner from './spinner.js';
import MessageElement from './message.js'; //Do I need this for dataentry?

const MESSAGE_LIMIT = 20;
const RECENT_MESSAGE_THRESHOLD = 60; // sec
const DEFAULT_AGENT = 'Agent'; //Probably can make this 'Advocate'
const DEFAULT_PLACEHOLDER = 'Write a message...';
const DEFAULT_PLACEHOLDER_DISABLED = '';
const DEFAULT_FIELD_PLACEHOLDER = 'Enter field value...';

export default class Dataentry {
  constructor(user) {
    this.user = user;
    this.element = parseDom(`<div class='-sbd-dataentry'>
            <div class='-sbd-dataentry-header'>
                <div class='close'></div>
            </div>
            <div class='-sbd-dataentry-form'>
                <input type='text' class='field1' placeholder='${DEFAULT_FIELD_PLACEHOLDER}'></input>
                <input type='text' class='field2' placeholder='${DEFAULT_FIELD_PLACEHOLDER}'></input>
            </div>
            <div class='-sbd-createticket'>
                <div class='createticket'>
                  <div class='label'>Create Ticket.</div>
                </div>
            </div>
        </div>`);

    // Probably keep this - this signs out
    const close = simplify(this.element.querySelector('.close'));
    close.on('click', () => {
      alert('dataentry close');
      this.close();
    });

    this.spinner = new Spinner();

    this.form = simplify(this.element.querySelector('.-sbd-dataentry-form'));
    this.input1 = simplify(this.form.querySelector('.field1'));
    this.input2 = simplify(this.form.querySelector('.field2'));
    this.editable = true; // What does this do?

    //Duplicate this for each input field
    //May also need a 'leave field' event that does the same thing. (May actually replace this one)
    this.input1.on('keypress', e => {
      if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        const text1 = this.input1.val();
        this.input1.val('');
      }
    });

    // Need a checkbox for 'Bot', for when that is implemented

    const createticket = simplify(this.element.querySelector('.createticket'));
    createticket.on('click', () => {
      //do the switch to the ticket dialog
      //need to pass along the entered datafields

      // Should make these entered fields as well, with defaults
      const ticketNum = ('000' + (new Date().getTime() % 1000)).slice(-3);
      const tempTicketTitle = `Issue #${ticketNum}`;
      // Also need data entry field(s) for associated chat(s) - optional
      this.dataentryform = simplify(document.querySelector('.-sbd-dataentry-form'));
      this.spinner.attachTo(this.dataentryform);
      //alert(ticketNum + tempTicketTitle + user.nickname);
      SendBirdDesk.Ticket.create(
        tempTicketTitle, 
        user.nickname,
        // "",
        // {
        //   issuetype: "Question",
        //   component: "iPad",
        //   sentiment: "Normal"
        // },
        (ticket, err) => {
          if (err) throw err;
          this.spinner.detach();
          //this.dialog = new Dialog(ticket);
          //this.dialog.open(this);
          this.startNewDialog(ticket);
        }
      )
      //alert('after create ticket');
    });
  };

  open(widget) {
    if (widget) {
      this.isOpened = true;
      this.widget = widget;
      this.widget.panel.appendChild(this.element);
      this.element.addClass('opened');
    }
  }
  close(instant) {
    if (instant) {
      this.element.hide();
      if (this.element.parentNode) {
        this.widget.panel.removeChild(this.element);
      }
    } else {
      this.element.removeClass('opened');
      setTimeout(() => {
        if (this.element.parentNode) {
          this.widget.panel.removeChild(this.element);
        }
      }, 1000);
    }
    this.isOpened = false;
  }
  enableForm() {
    this.editable = true;
    this.form.removeClass('disabled');
    // this.input.attr('readonly', '');
    // this.input.attr('placeholder', DEFAULT_PLACEHOLDER);
    this.attach.show();
  }
  disableForm() {
    this.editable = false;
    this.form.addClass('disabled');
    // this.input.attr('readonly', 'readonly');
    // this.input.attr('placeholder', DEFAULT_PLACEHOLDER_DISABLED);
    this.attach.hide();
  }
  startNewDialog(ticket) {
    this.element.removeClass('opened');
    setTimeout(() => {
      if (this.element.parentNode) {
        this.widget.panel.removeChild(this.element);
      }
    }, 1000);
    this.isOpened = false;
    this.dialog = new Dialog(ticket);
    this.dialog.open(widget);
  }
}

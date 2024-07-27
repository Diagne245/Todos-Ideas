import MainStore from '../services/mainStore';
import GroupStore from '../services/groupStore';
import { app } from './index.js';

class Storage {
  // @User----------------
  static setUserName(userName) {
    localStorage.setItem('userName', userName);
  }
  static getUserName() {
    return localStorage.getItem('userName');
  }

  // @Groups Methods----------------------
  static onGroupPage() {
    return localStorage.getItem('current-group') ? true : false;
  }

  static setCurrentGroup(groupTitle) {
    localStorage.setItem('current-group', groupTitle);
  }
  static getCurrentGroupTitle() {
    return localStorage.getItem('current-group');
  }

  static setCurrentGroupID(groupID) {
    localStorage.setItem('current-group-ID', groupID);
  }
  static getCurrentGroupID() {
    return localStorage.getItem('current-group-ID');
  }

  static clearCurrentGroup() {
    localStorage.removeItem('current-group');
  }
  static clearCurrentGroupID() {
    localStorage.removeItem('current-group-ID');
  }

  // Selecting Items ------------------------
  static getSelectedItems() {
    return !sessionStorage.getItem('selected')
      ? []
      : JSON.parse(sessionStorage.getItem('selected'));
  }

  static selectItem(itemID) {
    const selectedItems = this.getSelectedItems();
    selectedItems.push(itemID);
    sessionStorage.setItem('selected', JSON.stringify(selectedItems));
  }

  static removeFromSelection(itemID) {
    const selectedItems = this.getSelectedItems();
    selectedItems.splice(selectedItems.indexOf(itemID), 1);
    sessionStorage.setItem('selected', JSON.stringify(selectedItems));
  }

  static async getArrayOfSelectedItems() {
    if (app.srcGroup === null) {
      // Selecting from main
      const items = await MainStore.getItems();
      return items.filter((item) =>
        Storage.getSelectedItems().includes(item._id)
      );
    } else {
      // Selecting from a group slide
      const srcGroup = await GroupStore.getGroupByID(app.srcGroupID);
      return srcGroup.slides[app.selectionSrc].slideItems.filter((item) =>
        Storage.getSelectedItems().includes(item._id)
      );
    }
  }

  static clearSelected() {
    sessionStorage.removeItem('selected');
  }
  
  static clear() {
    this.clearSelected()
    this.clearCurrentGroup()
    this.clearCurrentGroupID()
  }
}

// ---------------------------------------
export default Storage;

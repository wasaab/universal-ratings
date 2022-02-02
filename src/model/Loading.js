export default class Loading {
  static VIEW = 'view';
  static PAGE = 'page';

  static determineType(currView, targetView) {
    return targetView === currView ? Loading.PAGE : Loading.VIEW;
  }
}
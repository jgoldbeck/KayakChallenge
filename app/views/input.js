function formView () {

        return ('<!DOCTYPE html>'+
        '<form>' +
        '<input id="GET-dest" name="dest" type="text" placeholder="enter destination" required>'+
        '<input type="submit" value="Find nearby high temperatures!">'+
        '</form>');
}
exports.formView  = formView;

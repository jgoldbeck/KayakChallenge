function formView () {

        return ('<form>\n' +
        '<input id="GET-dest" name="dest" type="text" placeholder="enter zip or city, state" required>\n'+
        '<input type="submit" value="Find nearby high temperatures">\n'+
        '</form>');
}
exports.formView  = formView;

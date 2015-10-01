describe('my app', function() {
        it('should login', function() {
                //browser().navigateTo('/');

                input('username').enter('steph');
                input('password').enter('steph');
                element('#login').click();

                expect(browser().location().url()).toBe("/home");

                expect(element('#user').text()).toEqual('steph');
        });
});
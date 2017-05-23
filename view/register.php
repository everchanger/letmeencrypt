<div class="col-xs-12 col-sm-offset-3 col-sm-6">
    <h4>Sign up</h4>
    <form action="?controller=user&action=register" method="POST" class="form-horizontal" id="register">
        <div class="form-group">
            <label for="register_email" class="col-xs-3 control-label">Email</label>
            <div class="col-xs-9">
                <input type="email" required class="form-control" id="register_email" placeholder="user@email.net" />
            </div>
        </div>
        <div class="form-group">
            <label for="register_password1" class="col-xs-3 control-label">Password</label>
            <div class="col-xs-9">
                <input type="password" required class="form-control" id="register_password1" placeholder="Password" />
            </div>
        </div>
        <div class="form-group">
            <label for="register_password2" class="col-xs-3 control-label">Confirm password</label>
            <div class="col-xs-9">
                <input type="password" required class="form-control" id="register_password2" placeholder="Confirm password" />
            </div>
        </div>
        <div class="form-group">
            <label class="col-xs-3 control-label">Private key storage</label>
            <div class="col-xs-9">
            <div class="radio">
                <label><input type="radio" name="key_choice" id="opt0" checked>Store using account password</label>
                <p class="help-block">This is the default way of storing your key, it makes accessing your account from multiple computers super easy!</p>
            </div>
            <div class="radio">
                <label><input type="radio" name="key_choice" id="opt1">Store using another password</label>
                <p class="help-block">A slightly more secure way of storage. Using this option means you will have one password for your account and another for your private key.</p>
            </div>
            <div class="radio">
                <label><input type="radio" name="key_choice" id="opt2">Store offline with a password</label>
                <p class="help-block">For the paranoid user! You get an encrypted version of your private key, store it where you want. It might be a bit more of a hastle to manage with multiple computers but if you don't trust us, don't let us store your private key!</p>
            </div>
            </div>
        </div>
        <div class="hidden-elm" id="key_passwords">
            <div class="form-group">
                <label for="key_password1" class="col-xs-3 control-label">Private key password</label>
                <div class="col-xs-9">
                    <input type="password" class="form-control" id="key_password1" placeholder="Key password" />
                </div>
            </div>
            <div class="form-group">
                <label for="key_password2" class="col-xs-3 control-label">Confirm private key password</label>
                <div class="col-xs-9">
                    <input type="password" class="form-control" id="key_password2" placeholder="Confirm key password" />
                </div>
            </div>
        </div>
        <div class="form-group">
            <div class="col-xs-offset-3 col-xs-9">
                <input type="submit" class="btn btn-default" value="Register" />
            </div>
        </div>
    </form>
</div>

<script type="text/javascript" src="js/register.js"></script>
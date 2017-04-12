<div class="col-xs-12 col-sm-offset-3 col-sm-6">
    <h4>Sign up</h4>
    <form action="?controller=user&action=register" method="POST" class="form-horizontal">
        <div class="form-group">
            <label for="email" class="col-xs-3 control-label">Email</label>
            <div class="col-xs-9">
                <input type="email" class="form-control" name="email" placeholder="user@mail.net" />
            </div>
        </div>
        <div class="form-group">
            <label for="password1" class="col-xs-3 control-label">Password</label>
            <div class="col-xs-9">
                <input type="password" class="form-control" name="password1" placeholder="Password" />
            </div>
        </div>
        <div class="form-group">
            <label for="password2" class="col-xs-3 control-label">Confirm password</label>
            <div class="col-xs-9">
                <input type="password" class="form-control" name="password2" placeholder="Confirm password" />
            </div>
        </div>
        <div class="form-group">
            <div class="col-xs-offset-3 col-xs-9">
                <button type="submit" class="btn btn-default">Register</button>
            </div>
        </div>
    </form>
</div>
<div class="col-xs-12 col-sm-offset-3 col-sm-6">
    <h4>Sign up</h4>
    <form action="?controller=user&action=register" method="POST" class="form-horizontal" id="register">
        <div class="form-group">
            <label for="email" class="col-xs-3 control-label">Email</label>
            <div class="col-xs-9">
                <input type="email" required class="form-control" name="email" id="email" placeholder="user@email.net" />
            </div>
        </div>
        <div class="form-group">
            <label for="password1" class="col-xs-3 control-label">Password</label>
            <div class="col-xs-9">
                <input type="password" required class="form-control" name="password1" id="password1" placeholder="Password" />
            </div>
        </div>
        <div class="form-group">
            <label for="password2" class="col-xs-3 control-label">Confirm password</label>
            <div class="col-xs-9">
                <input type="password" required class="form-control" name="password2" id="password2" placeholder="Confirm password" />
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
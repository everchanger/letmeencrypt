<div id="privateUnlockModal" class="modal fade">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h4 class="modal-title">Decrypt private key</h4>
            </div>
            <div class="modal-body">
                <div ckass="input-group">
                <input type="password" class="form-control" id="private_password1" placeholder="Password">
                <input type="password" class="form-control" id="private_password2" placeholder="Confirm password">
                </div>
                <p class="help-block">Your private key is loaded we just need to decrypt it for you to be able to use it.</p>
            </div>
            <div class="modal-footer">
                <button type="button" id="unlock_private_key" class="btn btn-primary" data-dismiss="modal">Decrypt key</button>
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>
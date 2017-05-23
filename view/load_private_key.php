<div id="privateModal" class="modal fade">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
                <h4 class="modal-title">Load private key</h4>
            </div>
            <div class="modal-body">
                <div class="input-group">
                    <label for="private_key" class="input-group-btn">
                        <span class="btn btn-primary">Browse
                            <input type="file" id="private_key" accept="privateKey" onchange="readKeyFromInput(this.files)" class="hidden">
                        </span>
                    </label>
                    <input type="text" class="form-control" readonly="">
                </div>
                <div ckass="input-group">
                <input type="password" class="form-control" id="private_password" placeholder="Password">
                </div>
                <p class="help-block">Your private key will not be submited to the server only used localy by javascript to decrypt your files for you.</p>
            </div>
            <div class="modal-footer">
                <button type="button" id="load_private_key" class="btn btn-primary" disabled data-dismiss="modal">Load and decrypt</button>
                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
            </div>
        </div>
    </div>
</div>
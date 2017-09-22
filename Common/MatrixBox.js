// This is a modified version of the matrix stack that stores translations,
// rotations, and scales separately and then evaluates them when the value is
// accessed, thus preventing the need for a lot of mucking around

function MatrixBox(viewMat) {
    this.scale = [0,0,0];
    this.translate = [0,0,0];
    this.rotate = [0,0,0];
    this.base = viewMat;
}

MatrixBox.prototype.eval = function() {
    trans = translate(this.translate[0],this.translate[1],this.translate[2]);
    scale = scalem(this.scale[0],this.scale[1],this.scale[2]);
    rotate = [rotateX(rotate[0]),rotateY(rotate[1]),rotateZ(rotate[2])];
    m = mat4(this.base);
    m = mult(m,scale);
    m = mult(m,rotate[0]);
    m = mult(m,rotate[1]);
    m = mult(m,rotate[2]);
    m = mult(m,trans);
    return m;
};

MatrixBox.prototype.scale = function(x,y,z) {
    this.scale[0] *= x;
    this.scale[1] *= y;
    this.scale[2] *= z;
};

MatrixBox.prototype.rotateX = function(t) {
    this.rotate[0] += t;
};

MatrixBox.prototype.rotateY = function(t) {
    this.rotate[1] += t;
};

MatrixBox.prototype.rotateZ = function(t) {
    this.rotate[2] += t;
};

MatrixBox.prototype.translate = function(x,y,z) {
    this.translate[0] += x;
    this.translate[1] += y;
    this.translate[2] += z;
};

function MBStack(viewMat) {
    this.mbs = [new MatrixBox(viewMat)];
};

MBStack.prototype.push = function() {
    this.mbs.push(

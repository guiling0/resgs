// ===== 进入动画 =====
(function () {
    var o = document.getElementById('entry-overlay');
    var logo = document.getElementById('entry-logo');
    // logo 渐入
    requestAnimationFrame(function () {
        logo.style.opacity = '1';
        logo.style.transform = 'translateY(0) scale(1)';
    });
    // 点击进入
    o.addEventListener('click', function () {
        function enter() {
            o.style.opacity = '0';
            setTimeout(function () { o.remove(); }, 400);
        }
        enter();
    });
    // 暴露给引擎：加载完成后自动关闭
    window.closeEntryOverlay = function () {
        o.style.opacity = '0';
        setTimeout(function () { o.remove(); }, 400);
    };
})();

// ===== 旋转提示 =====
(function () {
    var rh = document.getElementById('rotate-hint');
    function check() {
        rh.style.display = (window.innerWidth < window.innerHeight) ? 'flex' : 'none';
    }
    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', function () {
        setTimeout(check, 100);
    });
    check();
})();

// ===== DOM 浮层同步缩放 =====
(function () {
    var DW = 1920, DH = 1080;
    var box = document.getElementById('dom-overlays');
    function sync() {
        var vw = window.innerWidth, vh = window.innerHeight;
        var s = Math.min(vw / DW, vh / DH);
        box.style.left = ((vw - DW * s) / 2) + 'px';
        box.style.top = ((vh - DH * s) / 2) + 'px';
        box.style.transform = 'scale(' + s + ')';
    }
    window.addEventListener('resize', sync);
    sync();
})();

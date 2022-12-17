onload = () => {
    let canRedo = false, check = 0, color = 'black', data = [], log = [], logIndex = -1, pushed = false;
    let ascii = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    function change(elem){
        switch(check){
            case 0:
                elem.style.background = color;
                elem.style.color = '';
                elem.innerText = '';
                break;
            case 1:
                elem.style.background = '';
                elem.style.color = color;
                elem.innerText = '×';
                break;
            case 2:
                elem.innerText = '';
                elem.style.background = '';
                elem.style.color = '';
                break;
        }
    }

    function convert1(text, size){
        if(text.length == 1){
            let ret = [];
            for(let i = 0;i < size;i++){
                ret.push(parseInt(text));
            }
            return ret;
        }
        let tableString = text.slice(-3);
        text = text.slice(0, -3);
        let tableNum = 0;
        for(let c of tableString){
            if(!ascii.includes(c)){
                return NaN;
            }
            tableNum = tableNum * 62 + ascii.indexOf(c);
        }
        let table = [];
        for(let c of tableNum.toString(2).padStart(15, 0)){
            table.push(Number(c) ? Math.max(0, ...table) + 1 : 0);
        }
        let tableLength = Math.max(...table);
        let n = 0n;
        for(let c of text){
            if(!ascii.includes(c)){
                return NaN;
            }
            n = n * 62n + BigInt(ascii.indexOf(c));
        }
        let ret = [];
        for(let c of n.toString(tableLength).padStart(size, 0)){
            ret.push(table.indexOf(parseInt(c, tableLength) + 1));
        }
        return ret;
    }

    function convert2(arr){
        let used = [...Array(15).keys()].map(a => Number(arr.includes(a)));
        let table = [];
        for(let i = 0;i < 15;i++){
            table.push(used[i] ? Math.max(0, ...table) + 1 : 0);
        }
        let tableLength = Math.max(...table);
        if(tableLength == 1){
            let only = used.indexOf(1);
            if(only < 14){
                return only.toString(16);
            }else{
                return '';
            }
        }
        let fixed = arr.map(a => (table[a] - 1).toString(15)).join('');
        let n = 0n;
        for(let c of fixed){
            n *= BigInt(tableLength);
            n += BigInt(parseInt(c, 16));
        }
        let ret = '';
        let usedNum = parseInt(used.join(''), 2);
        for(let i = 0;i < 3;i++){
            ret = ascii[usedNum % 62] + ret;
            usedNum = (usedNum - usedNum % 62) / 62;
        }
        while(n){
            ret = ascii[n % 62n] + ret;
            n /= 62n;
        }
        return ret;
    }

    function genCells(rowInfo, colInfo){
        let tbodyElem = document.getElementById('main');
        let row = '<tr>' + '<td></td>'.repeat(colInfo.length + 1) + '</tr>';
        tbodyElem.innerHTML = row.repeat(rowInfo.length + 1);
        let tdElems = document.getElementsByTagName('td');
        let width = 0;
        for(let i = 1;i <= rowInfo.length;i++){
            let text = rowInfo[i - 1].join(' ');
            tdElems[i * (colInfo.length + 1)].innerHTML = text;
            width = Math.max(width, text.length);
        }
        for(let i = 1;i <= colInfo.length;i++){
            tdElems[i].innerText = colInfo[i - 1].join('\n');
        }
        tdElems[0].style.width = width * 10 + 'px';
        tdElems[0].style.textAlign = 'center';
        setMethod();
    }

    function loadLog(idx){
        let codeArea = document.getElementById('code');
        let tmp = codeArea.value;
        codeArea.value = log[idx];
        document.getElementById('1').click();
        codeArea.value = tmp;
    }

    function saveLog(){
        let codeArea = document.getElementById('code');
        let tmp = codeArea.value;
        document.getElementById('2').click();
        if(log[logIndex] != codeArea.value){
            log[++logIndex] = codeArea.value;
        }
        codeArea.value = tmp;
    }

    function setMethod(){
        let tdElems = document.getElementsByTagName('td');
        let trElems = document.getElementsByTagName('tr');
        let cells = tdElems.length;
        let rows = trElems.length;
        let cols = cells / rows;
        data = Array(cells);
        for(let index = cols;index < cells;index++){
            if(index % cols == 0){
                continue;
            }
            elem = tdElems[index];
            data[index] = 2;

            elem.onmousedown = function(){
                pushed = true;
                if(data[index] == 0 && this.style.background != color){
                    check = data[index];
                }else if(data[index] == 1 && this.style.color != color){
                    check = data[index];
                }else{
                    data[index] = check = (data[index] + 1) % 3;
                }
                change(this);
            }

            elem.onmouseout = function(){
                for(let i = index % cols;i < cells;i += cols){
                    if(data[i] != 0 && tdElems[i].style.background != 'deeppink'){
                        tdElems[i].style.background = '';
                    }
                }
                trElems[Math.floor(index / cols)].style.background = '';
            }

            elem.onmouseover = function(){
                if(pushed){
                    data[index] = check;
                    change(this);
                }
                for(let i = index % cols;i < cells;i += cols){
                    if(data[i] != 0 && tdElems[i].style.background != 'deeppink'){
                        tdElems[i].style.background = '#DDD';
                    }
                }
                trElems[Math.floor(index / cols)].style.background = '#DDD';
            }
        }

        let btn = document.createElement('button');
        tdElems[0].appendChild(btn);
        btn.innerText = 'check\nanswer';
        btn.style.margin = '5px 5px';
        btn.onclick = function(){
            let valid = true;
            for(let i = 1;i < rows;i++){
                let elem = tdElems[i * cols], countArray = [], count = 0;
                for(let j = 0;j < cols;j++){
                    if(colorList.includes(tdElems[i * cols + j].style.background)){
                        count++;
                    }else if(count){
                        countArray.push(count);
                        count = 0;
                    }
                }
                if(count || !countArray.length){
                    countArray.push(count);
                }
                if(elem.innerText != countArray.join(' ')){
                    elem.style.background = 'deeppink';
                    valid = false;
                }else{
                    elem.style.background = '';
                }
            }
            for(let j = 1;j < cols;j++){
                let elem = tdElems[j], countArray = [], count = 0;
                for(let i = 0;i < rows;i++){
                    if(colorList.includes(tdElems[i * cols + j].style.background)){
                        count++;
                    }else if(count){
                        countArray.push(count);
                        count = 0;
                    }
                }
                if(count){
                    countArray.push(count);
                }
                if(elem.innerText != countArray.join('\n')){
                    elem.style.background = 'deeppink';
                    valid = false;
                }else{
                    elem.style.background = '';
                }
            }
            if(valid){
                alert('correct!!');
            }
        }
    }

    onmouseup = function(){
        if(pushed){
            saveLog();
            canRedo = false;
        }
        pushed = false;
    }

    document.getElementById('1').onclick = function(){
        let tdElems = document.getElementsByTagName('td');
        let inputs = document.getElementById('code').value.trim().split('\n');
        if(inputs.length != 3 && inputs.length != 4){
            document.getElementById('message').innerText = 'フォーマットエラー';
            return;
        }
        let arr = inputs[0].split(' ').map(Number);
        let rows = arr[0], cols = arr[1];
        let rowInfo = inputs[1].split('/').map(a => a.trim().split(' ').map(Number));
        let colInfo = inputs[2].split('/').map(a => a.trim().split(' ').map(Number));
        let cellData = inputs[3] ? convert1(inputs[3], rows * cols) : '';
        if((rowInfo + colInfo + cellData).includes('NaN')){
            document.getElementById('message').innerText = 'フォーマットエラー';
            return;
        }
        if(rowInfo.length != rows){
            document.getElementById('message').innerText = '列数が列の情報数と一致しません';
        }else if(colInfo.length != cols){
            document.getElementById('message').innerText = '行数が行の情報数と一致しません';
        }else{
            genCells(rowInfo, colInfo);
            document.getElementById('message').innerText = example;
            if(cellData){
                for(let i = 1;i <= rows;i++){
                    for(let j = 1;j <= cols;j++){
                        let checkAndColor = cellData[(i - 1) * cols + (j - 1)];
                        color = colorList[checkAndColor % 7];
                        check = (checkAndColor - checkAndColor % 7) / 7;
                        data[i * (cols + 1) + j] = check;
                        change(tdElems[i * (cols + 1) + j]);
                    }
                }
                for(let button of document.getElementsByName('color-radio')){
                    if(button.class == 'selected'){
                        color = button.value;
                        break;
                    }
                }
            }
        }
        saveLog();
    }

    document.getElementById('2').onclick = function(){
        let tdElems = document.getElementsByTagName('td');
        let trElems = document.getElementsByTagName('tr');
        let cells = tdElems.length;
        let rows = trElems.length;
        let cols = cells / rows;
        let rowInfo = [], colInfo = [];
        for(let i = 1;i < rows;i++){
            let info = tdElems[i * cols].innerText;
            rowInfo.push(info.split(' ').map(Number));
        }
        for(let i = 1;i < cols;i++){
            let info = tdElems[i].innerText;
            colInfo.push(info.split('\n').map(Number));
        }
        let cellData = [], _color;
        for(let i = 1;i < rows;i++){
            for(let j = 1;j < cols;j++){
                let elem = tdElems[i * cols + j];
                if(colorList.includes(elem.style.background)){
                    _color = elem.style.background;
                    cellData.push(colorList.indexOf(_color));
                }else if(elem.innerText == '×'){
                    _color = elem.style.color;
                    cellData.push(colorList.indexOf(_color) + 7);
                }else{
                    cellData.push(14);
                }
            }
        }
        document.getElementById('code').value = `${rows - 1} ${cols - 1}\n`;
        document.getElementById('code').value += rowInfo.map(a => a.join(' ')).join('/') + '\n';
        document.getElementById('code').value += colInfo.map(a => a.join(' ')).join('/') + '\n';
        document.getElementById('code').value += convert2(cellData);
    }

    document.getElementById('undo').onclick = function(){
        if(0 < logIndex){
            loadLog(--logIndex);
        }
        canRedo = true;
    }

    document.getElementById('redo').onclick = function(){
        if(canRedo && log[logIndex + 1]){
            loadLog(++logIndex);
        }
    }

    onkeyup = function(event){
        if(!event.ctrlKey){
            return;
        }
        if(event.keyCode == 0x5a && event.shiftKey){
            document.getElementById('redo').click();
        }else if(event.keyCode == 0x5a){
            document.getElementById('undo').click();
        }else if(event.keyCode == 0x59){
            document.getElementById('redo').click();
        }
    }

    let buttons = document.getElementsByName('color-radio');
    let colorList = []
    for(let button of buttons){
        button.style.backgroundColor = button.value;
        button.onclick = function(){
            color = this.value;
            for(let _button of buttons){
                if(_button == this){
                    _button.className = 'selected';
                    _button.style.outlineColor = color;
                }else{
                    _button.className = '';
                }
            }
        }
        colorList.push(button.value);
    }

    document.getElementById('code').placeholder = '行数 列数\n各行の情報(横書きの数)\n各列の情報(縦書きの数)\n各セルの情報(必要に応じて)';
    genCells([[5], [1, 1, 1], [5], [1, 1, 1], [5]], [[5], [1, 1, 1], [5], [1, 1, 1], [5]]);
    let example = document.getElementById('message').innerText = '<sample>\n10 10\n3/1/1 5/5/0/5/1 1/1 1/1 1/5\n1 5/1 1 1 1/1 1 1 1/4 1 1/1 5/1/1/1/1/1';
    saveLog();
};
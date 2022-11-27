onload = () => {
    let pushed = false, color = 1, data;
    let ascii = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    function change(elem){
        switch(color){
            case 0:
                elem.innerText = '';
                break;
            case 1:
                elem.style.background = 'black';
                break;
            case 2:
                elem.style.background = '';
                elem.innerText = '×';
                break;
        }
    }

    function convert(text, mode){
        if(mode == 1){
            let n = 0n;
            for(let c of text){
                if(!ascii.includes(c))return NaN;
                n = n * 62n + BigInt(ascii.indexOf(c));
            }
            return n.toString(3);
        }else if(mode == 2){
            let n = 0n;
            for(let c of text){
                n = n * 3n + BigInt(c);
            }
            let ret = '';
            while(n){
                ret = ascii[n % 62n] + ret;
                n /= 62n;
            }
            return ret;
        }
    }

    function genCells(rowInfo, colInfo){
        let tbodyElem = document.getElementById('main');
        let row = '<tr>' + '<td></td>'.repeat(colInfo.length + 1) + '</tr>';
        tbodyElem.innerHTML = row.repeat(rowInfo.length + 1);
        let tdElems = document.getElementsByTagName('td');
        let width = 7;
        for(let i = 1; i <= rowInfo.length; i++){
            let text = rowInfo[i - 1].join(' ');
            tdElems[i * (colInfo.length + 1)].innerHTML = text;
            width = Math.max(width, text.length);
        }
        for(let i = 1; i <= colInfo.length; i++){
            tdElems[i].innerText = colInfo[i - 1].join('\n');
        }
        let leftmost = document.getElementById('leftmost');
        leftmost.innerText = `td:nth-child(${colInfo.length + 1}n+1){text-align:right;width:${width * 9}px}`;
        setMethod();
    }

    function setMethod(){
        let tdElems = document.getElementsByTagName('td');
        let trElems = document.getElementsByTagName('tr');
        let cells = tdElems.length;
        let rows = trElems.length;
        let cols = cells / rows;
        data = Array(cells);
        for(let index = cols; index < cells; index++){
            if(index % cols == 0)continue;
            elem = tdElems[index];
            data[index] = 0;

            elem.onmousedown = function(){
                pushed = true;
                data[index] = color = (data[index] + 1) % 3;
                change(this);
            }

            elem.onmouseout = function(){
                for(let i = index % cols; i < cells; i += cols){
                    if(data[i] == 1)continue;
                    tdElems[i].style.background = '';
                }
                trElems[Math.floor(index / cols)].style.background = ''
            }

            elem.onmouseover = function(){
                if(pushed){
                    data[index] = color;
                    change(this);
                }
                for(let i = index % cols; i < cells; i += cols){
                    if(data[i] == 1)continue;
                    tdElems[i].style.background = '#DDD';
                }
                trElems[Math.floor(index / cols)].style.background = '#DDD'
            }
        }
    }

    onmouseup = function(){
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
        let cellData = inputs[3] ? convert(inputs[3], 1) : '';
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
            cellData = cellData.padStart(rows * cols, 0);
            for(let i = 1; i <= rows; i++){
                for(let j = 1; j <= cols; j++){
                    color = Number(cellData[(i - 1) * cols + (j - 1)]);
                    data[i * (cols + 1) + j] = color;
                    change(tdElems[i * (cols + 1) + j]);
                }
            }
        }
    }

    document.getElementById('2').onclick = function(){
        let tdElems = document.getElementsByTagName('td');
        let trElems = document.getElementsByTagName('tr');
        let cells = tdElems.length;
        let rows = trElems.length;
        let cols = cells / rows;
        let rowInfo = [], colInfo = [];
        for(let i = 1; i < rows; i++){
            let info = tdElems[i * cols].innerText;
            rowInfo.push(info.split(' ').map(Number));
        }
        for(let i = 1; i < cols; i++){
            let info = tdElems[i].innerText
            colInfo.push(info.split('\n').map(Number));
        }
        let cellData = '';
        for(let i = 1; i < rows; i++){
            for(let j = 1; j < cols; j++){
                let elem = tdElems[i * cols + j];
                if(elem.style.background == 'black'){
                    cellData += 1;
                }else if (elem.innerText == '×'){
                    cellData += 2;
                }else{
                    cellData += 0;
                }
            }
        }
        document.getElementById('code').value = `${rows - 1} ${cols - 1}\n`;
        document.getElementById('code').value += rowInfo.map(a => a.join(' ')).join('/') + '\n';
        document.getElementById('code').value += colInfo.map(a => a.join(' ')).join('/') + '\n';
        document.getElementById('code').value += convert(cellData, 2);
    }

    document.getElementById('code').placeholder = '行数 列数\n各行の情報(横書きの数)\n各列の情報(縦書きの数)\n各セルの情報(必要に応じて)';
    genCells([[5], [1, 1, 1], [5], [1, 1, 1], [5]], [[5], [1, 1, 1], [5], [1, 1, 1], [5]]);
};
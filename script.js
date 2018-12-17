
var _combine_input = function () {
    // 開頭設定
    var _result = "";
    var _panel = $(".file-process-framework");

    // ------------------------------------------
    // 資料處理設定
    var _dist_mode = $(".dist-mode:visible").data("tab");

    if (_dist_mode === "normal") {
        _result = _calc_normal_dist();
    }
    else if (_dist_mode === "prop") {
        _result = _calc_prop_dist();
    }


    // ------------------------------------------
    // 結束設定

    var _input = _panel.find("#preview");
    _input.val(_result);

    _panel.find("#preview_html").html(_result);
};	// var _combine_input = function () {

var _calc_normal_dist = function () {
    var _dist = $('[name="input_dist"]:checked').val();
    //console.log(_dist);

    var _data_text = $("#input_data").val().split("\n");
    var _data = [];
    for (var _i = 0; _i < _data_text.length; _i++) {
        var _d = _data_text[_i];
        if (isNaN(_d) || _d.trim() === "") {
            continue;
        }
        else {
            _d = eval(_d.trim());
            _data.push(_d);
        }
    }

    var _n = _data.length;
    if (_n === 0) {
        return;
    }

    var _sum = 0;
    for (var _i = 0; _i < _data.length; _i++) {
        _sum = _sum + _data[_i];
    }
    var _avg = _sum / _data.length;

    // -----------------------------

    var _diff_mean_pow = 0;
    for (var _i = 0; _i < _data.length; _i++) {
        var _diff = _data[_i] - _avg;
        _diff = _diff * _diff;
        _diff_mean_pow = _diff_mean_pow + _diff;
    }

    var _s2 = _diff_mean_pow / (_data.length - 1);
    var _s = Math.sqrt(_s2);

    // ------------------------------------

    var _df = _data.length - 1;
    var _q = $("#input_alpha_q").val();
    _q = eval(_q) / 100;
    var _p = 1-_q;
    //_p = eval(_p);
    var _interval = 0;

    var _a = _s / (Math.sqrt(_n));
    var _score = 1;
    var _score_type = "t";

    if (_dist === "dist_auto") {
        if (_n < 30) {
            _dist = "dist_t";
        }
        else {
            _dist = "dist_normal";
        }
    }

    if (_dist === "dist_t") {
        var _score = tdistr(_df, _p / 2); // 修正，原本寫成查詢的是單尾，現在改成雙尾
        _interval = _score * _a;
    }
    else if (_dist === "dist_normal") {
        _score_type = "c";
        var _score = critz(_p / 2);
        if (_score < 0) {
            _score = _score * -1;
        }
        _interval = _score * _a;
    }


    // ----------------------------------



    // ----------------------------------

//        console.log({
//            x: _avg,
//            s2: _s2
//        });

    var _precision = $("#input_precise").val();
    _precision = eval(_precision);
    var _lower = _avg - _interval;
    _lower = precision_string(_lower, _precision);
    var _higher = _avg + _interval;
    _higher = precision_string(_higher, _precision);

    //var _q = (1 - _p) * 100;
    _q = _q * 100;
    var _result = '<div class="analyze-result"><table border="1" class="result"><tbody>'
            + '<tr><td rowspan="2">&nbsp;</td><td style="vertical-align: bottom;text-align: center;" rowspan="2">母體平均數</td>'
            + '<td style="vertical-align: bottom;text-align: center;" rowspan="2">母體標準差</td>'
            + '<td style="vertical-align: bottom;text-align: center;" rowspan="2">' + _score_type + '值</td>'
            + '<td style="vertical-align: bottom;text-align: center;" rowspan="2">df</td>'
            + '<td style="vertical-align: bottom;text-align: center;" rowspan="2">抽樣誤差</td>'
            + '<td colspan="2">' + _q + '%差異數的信賴區間</td></tr>'
            + '<tr><td style="text-align: center;">下限</td><td style="text-align: center;">上限</td></tr>'
            + '<tr>'
            + '<td>變項</td>'
            + '<td style="text-align: right;">' + precision_string(_avg, _precision) + '</td>'
            + '<td style="text-align: right;">' + precision_string(_s, _precision) + '</td>'
            + '<td style="text-align: right;">' + precision_string(_score, _precision) + '</td>'
            + '<td style="text-align: right;">' + _df + '</td>'
            + '<td style="text-align: right;">' + precision_string(_interval, _precision) + '</td>'
            + '<td style="text-align: right;">' + _lower + '</td>'
            + '<td style="text-align: right;">' + _higher + '</td>'
            + '</tr>'
            + '</tbody></table><div>分析結果顯示，(' + _lower + ', ' + _higher + ')有' + _q + '%的機會包含母體平均數。</div></div>';
    //_result = (_lower) + ", " + _avg + ", " + (_higher);
    return _result;
};

var _calc_prop_dist = function () {
    var _n = $("#input_n").val();
    _n = eval(_n);
    var _q = $("#input_alpha_q").val();
    _q = eval(_q) / 100;
    var _p = 1-_q;
    
    var _sample_p = $("#input_prop").val();
    _sample_p = eval(_sample_p);
    var _sample_q = 1 - _sample_p;
    
    var _score = critz(_p / 2);
    if (_score < 0) {
        _score = _score * -1;
    }
    
    var _interval = _score * Math.sqrt( (_sample_p * _sample_q) / _n );
    
    var _precision = $("#input_precise").val();
    _precision = eval(_precision);
    
    var _lower = _sample_p - _interval;
    var _higher = _sample_p + _interval;
    
    //var _q = (1 - _p) * 100;
    
    _q = _q * 100;
    _score = precision_string(_score, _precision);
    if ($("#input_display_percent:checked").length > 0) {
        _sample_p = precision_string(_sample_p * 100, _precision) + "%";
        _interval = precision_string(_interval*100, _precision) + "%";
        _lower = precision_string(_lower*100, _precision)+"%";
        _higher = precision_string(_higher*100, _precision)+"%";
    }
    else {
        _sample_p = precision_string(_sample_p, _precision);
        _interval = precision_string(_interval, _precision);
        _lower = precision_string(_lower, _precision);
        _higher = precision_string(_higher, _precision);
    }
    
    return '<div class="analyze-result"><table border="1" class="result"><tbody>'
            + '<tr><td rowspan="2">&nbsp;</td><td style="vertical-align: bottom;text-align: center;" rowspan="2">母體比例</td>'
            + '<td style="vertical-align: bottom;text-align: center;" rowspan="2">c值</td>'
            + '<td style="vertical-align: bottom;text-align: center;" rowspan="2">n</td>'
            + '<td style="vertical-align: bottom;text-align: center;" rowspan="2">抽樣誤差</td>'
            + '<td colspan="2">' + _q + '%差異數的信賴區間</td></tr>'
            + '<tr><td style="text-align: center;">下限</td><td style="text-align: center;">上限</td></tr>'
            + '<tr>'
            + '<td>變項</td>'
            + '<td style="text-align: right;">' + _sample_p + '</td>'
            + '<td style="text-align: right;">' + _score + '</td>'
            + '<td style="text-align: right;">' + _n + '</td>'
            + '<td style="text-align: right;">' + _interval + '</td>'
            + '<td style="text-align: right;">' + _lower + '</td>'
            + '<td style="text-align: right;">' + _higher + '</td>'
            + '</tr>'
            + '</tbody></table><div>分析結果顯示，(' + _lower + ', ' + _higher + ')有' + _q + '%的機會包含母體比例。</div></div>';
};

// ------------------------------------------------------

var LogGamma = function (Z) {
    with (Math) {
            var S=1+76.18009173/Z-86.50532033/(Z+1)+24.01409822/(Z+2)-1.231739516/(Z+3)+.00120858003/(Z+4)-.00000536382/(Z+5);
            var LG= (Z-.5)*log(Z+4.5)-(Z+4.5)+log(S*2.50662827465);
    }
    return LG;
};

var Betinc = function (X,A,B) {
	var A0=0;
	var B0=1;
	var A1=1;
	var B1=1;
	var M9=0;
	var A2=0;
	var C9;
	while (Math.abs((A1-A2)/A1)>.00001) {
		A2=A1;
		C9=-(A+M9)*(A+B+M9)*X/(A+2*M9)/(A+2*M9+1);
		A0=A1+C9*A0;
		B0=B1+C9*B0;
		M9=M9+1;
		C9=M9*(B-M9)*X/(A+2*M9-1)/(A+2*M9);
		A1=A0+C9*A1;
		B1=B0+C9*B1;
		A0=A0/B1;
		B0=B0/B1;
		A1=A1/B1;
		B1=1;
	}
	return A1/A;
};

var compute_T_DF = function (x, df) {
    var X = x;
    //df=eval(form.df.value)
    var tcdf, betacdf, A, S, Z, BT;
    with (Math) {
        if (df <= 0) {
            alert("Degrees of freedom must be positive");
        } else {
            A = df / 2;
            S = A + .5;
            Z = df / (df + X * X);
            BT = exp(LogGamma(S) - LogGamma(.5) - LogGamma(A) + A * log(Z) + .5 * log(1 - Z));
            if (Z < (A + 1) / (S + 2)) {
                betacdf = BT * Betinc(Z, A, .5);
            } else {
                betacdf = 1 - BT * Betinc(1 - Z, .5, A);
            }
            if (X < 0) {
                tcdf = betacdf / 2;
            } else {
                tcdf = 1 - betacdf / 2;
            }
        }
        tcdf = round(tcdf * 100000) / 100000;
    }
    return tcdf;
};
/*
var compute_DF_P = function (df, tcdf) {
    //var X = x;
    if (tcdf < 0 || tcdf > 1 ) {
        alert("P most be in 0~1.");
        return;
    }
    if (df <= 0) {
        alert("Degrees of freedom must be positive");
        return;
    }
    //df=eval(form.df.value)
    var betacdf, A, S, Z, BT;
    with (Math) {
        A = df / 2;
        S = A + .5;
        // Z = df / (df + X * X); // 還不行，沒有X
        BT = exp(LogGamma(S) - LogGamma(.5) - LogGamma(A) + A * log(Z) + .5 * log(1 - Z));
        
        //--------------------------
        
        tcdf = round(tcdf*100000)/100000;
        
        if (Z < (A + 1) / (S + 2)) {
            betacdf = BT * Betinc(Z, A, 0.5);
        } else {
            betacdf = 1 - BT * Betinc(1 - Z, 0.5, A);
        }
        
        // -----------------------------------
        
        
        Z=df/(df+X*X);
        BT=exp(LogGamma(S)-LogGamma(.5)-LogGamma(A)+A*log(Z)+.5*log(1-Z));
        if (Z<(A+1)/(S+2)) {
                betacdf=BT*Betinc(Z,A,.5);
        } else {
                betacdf=1-BT*Betinc(1-Z,.5,A);
        }
        if (X<0) {
                tcdf=betacdf/2;
        } else {
                tcdf=1-betacdf/2;
                // tcdf-1 = -
        }
        tcdf=round(tcdf*100000)/100000;
    }
    return tcdf;
};
*/
// done hiding from old browsers -->

// -----------------------------------------------------

tinyMCE.init({
	mode : "specific_textareas",
	editor_selector : "mceEditor",
	plugins: [
    'advlist autolink lists link image charmap print preview hr anchor pagebreak',
    'searchreplace wordcount visualblocks visualchars code fullscreen',
    'insertdatetime media nonbreaking save table contextmenu directionality',
    'emoticons template paste textcolor colorpicker textpattern imagetools codesample toc'
  ],
  toolbar1: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image  tableprops',
  toolbar2: 'print preview media | forecolor backcolor emoticons | codesample code ',

	setup:function(ed) {
	   ed.on('change', function(e) {
		   //console.log('the content ', ed.getContent());
		   _combine_input();
	   });
    }
});

var _convert_spec_to_table = function (_spec) {
	
	var _lines = _spec.split("\n");
	
	var _table = $('<div><table border="0" cellpadding="3" cellspacing="3"><tbody></tbody></table></div>');
	var _tbody = _table.find("tbody");
	
	for (var _i = 0; _i < _lines.length; _i++) {
		var _line = _lines[_i];
		
		if (_line.substr(0,1) === " ") {
			// 表示是前一格的內容
			_tbody.find("td:last").append("<br />" + _line);
		}
		
		var _pos = _line.indexOf(":");
		var _pos2 = _line.indexOf("：");
		if (_pos2 !== -1 && _pos2 < _pos) {
			_pos = _pos2;
		}
		
		if (_pos === -1) {
			continue;
		}
		
		var _title = _line.substr(0, _pos).trim();
		var _value = _line.substring(_pos+1, _line.length).trim();
		
		var _value_bg = '#fde4d0';
		if (_tbody.find("tr").length % 2 === 0) {
			_value_bg = '#fbcaa2';
		}
		
		var _value_style = "";
		if (_title === "有緣價") {
			_value_style = "font-weight: bold; color: red;";
		}
		
		var _tr = $('<tr>' 
			+ '<td style="text-align:right;padding: 5px; color: white; background: #f79646; font-weight: bold;">' + _title + '</td>'
			+ '<td style="padding: 5px; background: ' + _value_bg + ';' + _value_style + '">' + _value + '</td>'
			+ '</tr>').appendTo(_tbody);
		
	}
	
	return _table.html();
};	// var _convert_spec_to_table = function (_spec) {

// --------------------------

var _process_file = function(_input, _callback) {
	_callback(_input);        
};

var _output_filename_surffix="_output";


// -------------------------------------

var _load_file = function(evt) {
    //console.log(1);
    if(!window.FileReader) return; // Browser is not compatible

    var _panel = $(".file-process-framework");
    
    _panel.find(".loading").removeClass("hide");

    var reader = new FileReader();
    var _result;

    var _file_name = evt.target.files[0].name;
    
    reader.onload = function(evt) {
        if(evt.target.readyState !== 2) return;
        if(evt.target.error) {
            alert('Error while reading file');
            return;
        }

        //filecontent = evt.target.result;

        //document.forms['myform'].elements['text'].value = evt.target.result;
        _result =  evt.target.result;

        _process_file(_result, function (_result) {
            _panel.find(".preview").val(_result);
            _panel.find(".filename").val(_file_name);
                        
            $(".file-process-framework .myfile").val("");
            $(".file-process-framework .loading").addClass("hide");
            _panel.find(".display-result").show();
            _panel.find(".display-result .encoding").show();

            var _auto_download = (_panel.find('[name="autodownload"]:checked').length === 1);
            if (_auto_download === true) {
                _panel.find(".download-file").click();
            }
            
            //_download_file(_result, _file_name, "txt");
        });
    };

    var _pos = _file_name.lastIndexOf(".");
    _file_name = _file_name.substr(0, _pos)
        + _output_filename_surffix
        + _file_name.substring(_pos, _file_name.length);

    //console.log(_file_name);

    reader.readAsText(evt.target.files[0]);
};

var _load_textarea = function(evt) {
    var _panel = $(".file-process-framework");
    
    // --------------------------

    var _result = _panel.find(".input-mode.textarea").val();
    if (_result.trim() === "") {
        return;
    }

    // ---------------------------
    
    _panel.find(".loading").removeClass("hide");

    // ---------------------------
    var d = new Date();
    var utc = d.getTime() - (d.getTimezoneOffset() * 60000);
  
    var local = new Date(utc);
    var _file_name = local.toJSON().slice(0,19).replace(/:/g, "-");
    _file_name = "output_" + _file_name + ".txt";

    // ---------------------------

    _process_file(_result, function (_result) {
        _panel.find(".preview").val(_result);
        _panel.find(".filename").val(_file_name);

        _panel.find(".loading").addClass("hide");
        _panel.find(".display-result").show();
        _panel.find(".display-result .encoding").hide();

        var _auto_download = (_panel.find('[name="autodownload"]:checked').length === 1);
        if (_auto_download === true) {
            _panel.find(".download-file").click();
        }
    });
};

var _download_file_button = function () {
    var _panel = $(".file-process-framework");
    
    var _file_name = _panel.find(".filename").val();
    var _data = _panel.find(".preview").val();
    
    _download_file(_data, _file_name, "txt");
};


var _download_file = function (data, filename, type) {
    var a = document.createElement("a"),
        file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }

};

$(function () {
    $('.menu .item').tab();
    var _panel = $(".file-process-framework");
    //_panel.find(".input-mode.textarea").click(_load_textarea).keyup(_load_textarea);
    _panel.find(".myfile").change(_load_file);
    _panel.find(".download-file").click(_download_file_button);
    _panel.find(".change-trigger").change(_combine_input);
    _panel.find(".key-up-trigger").keyup(_combine_input);

    _panel.find(".focus_select").focus(function () {
        $(this).select();
    });

    //$('.menu .item').tab();


    $('#copy_source_code').click(function () {
        PULI_UTIL.clipboard.copy($("#preview").val());
    });

    $('#copy_source_code_html').click(function () {
        PULI_UTIL.clipboard.copy($("#preview_html_source").val());
    });

    _combine_input();
    
    /*
    var _d = [];
    for (var _i = 0; _i < 1100; _i++) {
        if (_i < 580) {
            _d.push(1);
        }
        else {
            _d.push(0);
        }
    }
    $("#input_data").val(_d.join("\n"));
    */
});
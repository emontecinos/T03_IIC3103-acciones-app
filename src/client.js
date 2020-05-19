import io from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom';
import {useEffect,useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    BarChart,
    Bar,
    Line,
    LineChart,
    Legend,
    XAxis,
    YAxis,
    Tooltip
} from 'recharts';
import {exchange_active,NavBar} from '../src/components/navbar'
import './client.css'
import Table from 'react-bootstrap/Table'


const socket = io('wss://le-18262636.bitzonte.com', {
    path: '/stocks',
    transports: ['websocket','polling']
});

function get_exchange(exchange_info, exchange_name){
    let retorno =null;
    Object.keys(exchange_info).map((exchange) => {
        if(exchange_info[exchange]['name']==exchange_name){
            console.log(exchange_info[exchange]);
            retorno= exchange_info[exchange];
        }
    });
    return retorno;
}

function get_ticker_comp(nombre_compania,stocks_info){
    let retorno = null;
    Object.keys(stocks_info).map((stock)=>{
        if(stocks_info[stock]['company_name']==nombre_compania){
            retorno=stocks_info[stock]['ticker'];
        }
    });
    return retorno;
}
function filter_ticker (exchange_info,data,exch_name,nombre_compania,stocks_info){
    let exchange;
    let ticker_c;
    console.log(nombre_compania);
    console.log(exch_name);
    exchange=get_exchange(exchange_info,exch_name);
    ticker_c = get_ticker_comp(nombre_compania,stocks_info);
    console.log(ticker_c);
    console.log(nombre_compania);
    return data.filter(i=>i['ticker']==ticker_c);

    
}
let exchange_info=[];
let stocks_info=[];
let max_values=[];
let min_values=[];
let last_value=[]
let variaciones=[];
var llenado=0;

function llenar_min_max_values(stocks_info){
    if (llenado===0 && stocks_info.length > 0){
        Object.keys(stocks_info).map((key)=>{
            min_values[stocks_info[key]['ticker']]=1000000;
            max_values[stocks_info[key]['ticker']]=0;
            last_value[stocks_info[key]['ticker']]=0;
            variaciones[stocks_info[key]['ticker']]=0;
        })
        llenado=1;
    }
    console.log(max_values,min_values);
    
    return 1;
}

socket.emit('EXCHANGES',/* */);
socket.once('EXCHANGES',(data) => {
    // setDataExchange(currentData=>[...currentData,data]);
    // exchange_info=data;
    // exchange_info[data.key]=data;
    Object.keys(data).forEach(function(key) {
        exchange_info[key] = data[key];
        // console.log(key);
        // console.log(data[key]);
    });
    console.log('EXCHANGE');
    console.log(exchange_info);
});
socket.emit('STOCKS',/* */);
socket.once('STOCKS',(data) => {
    // setDataStocks(currentData=>[...currentData,data]);
    Object.keys(data).forEach(function(key) {
        stocks_info[key] = data[key];
        // console.log(data[key]['ticker']);
    });
    console.log('STOCKS');
    // console.log(stocks_info);
});
function filter_volume_exchange(exchange,databuysell,stocks_info){
    let companies_tickers=[];
    Object.keys(stocks_info).map((key)=>{
        if(exchange['listed_companies'].includes(stocks_info[key]['company_name'])){
            companies_tickers.push(stocks_info[key]['ticker']);
        }
    })
    return databuysell.filter(i=>companies_tickers.includes(i['ticker']));
}
function get_volumen_compraventa(exchange,databuysell){
    var compra=0;
    Object.keys(filter_volume_exchange(exchange,databuysell,stocks_info)).map((key) =>{
        
        compra += databuysell[key]['volume'];
    })
    return compra;
    
}
function get_num_empresas(exchange){
    var num_empresas=exchange['listed_companies'].length;
    return num_empresas;
}

function get_frac_volumen(exchange_info,exchange_ticker,databuy,datasell,stocks_info){
    var vol_activo=get_volumen_total(exchange_info[exchange_ticker],databuy,datasell,stocks_info);
    var vol_total=0;
    Object.keys(exchange_info).map((exch)=>{
        vol_total += get_volumen_total(exchange_info[exch],databuy,datasell,stocks_info);
    })
    var frac=100*vol_activo/vol_total;
    return frac.toFixed(2);
}
function get_volumen_total(exchange,databuy,datasell,stocks_info){
    return get_volumen_compraventa(exchange,databuy,stocks_info)+get_volumen_compraventa(exchange,datasell,stocks_info)
}
function get_pais_compania(nombre_compania,stocks_info){
    let pais="";
    Object.keys(stocks_info).map((key)=>{
        if (stocks_info[key]['company_name']==nombre_compania){
            pais=stocks_info[key]['country'];
        }
    })
    return pais;
}

function filter_by_company(ticker,databuysell){
    return databuysell.filter(i=>i['ticker']==ticker);
}

function get_vol_transado(nombre_compania,stocks_info,databuy,datasell){
    let ticker="";
    Object.keys(stocks_info).map((key)=>{
        if (stocks_info[key]['company_name']==nombre_compania){
            ticker=stocks_info[key]['ticker'];
        }
    })
    var vol_vendido=0;
    var vol_comprado=0;
    Object.keys(filter_by_company(ticker,databuy)).map((key)=>{
        vol_comprado += databuy[key]['volume'];

    })
    Object.keys(filter_by_company(ticker,datasell)).map((key)=>{
        vol_vendido += datasell[key]['volume'];

    })
    return vol_comprado+vol_vendido;
}

function get_ticker(nombre_compania,stocks_info){
    let ticker="";
    Object.keys(stocks_info).map((key)=>{
        if (stocks_info[key]['company_name']==nombre_compania){
            ticker=stocks_info[key]['ticker'];
        }
    })
    return ticker;
}
function get_max_min_value(dataupdate){
    console.log(min_values,max_values);
    Object.keys(dataupdate).map((key)=>{
        if(dataupdate[key]['value'] > max_values[dataupdate[key]['ticker']]){
            max_values[dataupdate[key]['ticker']] =dataupdate[key]['value'];
        }
        if(dataupdate[key]['value'] < min_values[dataupdate[key]['ticker']]){
            min_values[dataupdate[key]['ticker']] =dataupdate[key]['value'];
        }
    })
    return 1;
    
}
function get_quote_base(nombre_compania,stocks_info){
    let quote=""
    Object.keys(stocks_info).map((key)=>{
        if (stocks_info[key]['company_name']==nombre_compania){
            quote=stocks_info[key]['quote_base'];
            return quote;
        }
    })
    return "USD";
}
function condition_exchange_active(exchange_info,dataupdate,exchange_active,stocks_info,databuy,datasell) {
    var exchange = get_exchange(exchange_info,exchange_active);
    console.log(exchange);
    if (exchange===null){
        return (
            <div>
                <h4>Información mercados disponibles</h4>
                <Table striped bordered size="sm">
                    <thead>
                        <tr>
                        <th>Exchange</th>
                        <th>Pais</th>
                        <th>Vol Compra</th>
                        <th>Vol Venta</th>
                        <th>Vol Total</th>
                        <th>Cantidad Acciones</th>
                        <th>Participacion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(exchange_info).map((exchange_ticker) =>{
                            
                            return (
                                <tr>
                                    <td>{exchange_info[exchange_ticker]['name']}</td>
                                    <td>{exchange_info[exchange_ticker]['country']}</td>
                                    <td>{Intl.NumberFormat("de-DE").format(get_volumen_compraventa(exchange_info[exchange_ticker],databuy,stocks_info))}</td>
                                    <td>{Intl.NumberFormat("de-DE").format(get_volumen_compraventa(exchange_info[exchange_ticker],datasell,stocks_info))}</td>
                                    <td>{Intl.NumberFormat("de-DE").format(get_volumen_total(exchange_info[exchange_ticker],databuy,datasell,stocks_info))}</td>
                                    <td>{get_num_empresas(exchange_info[exchange_ticker])}</td>
                                    <td>{get_frac_volumen(exchange_info,exchange_ticker,databuy,datasell,stocks_info)}%</td> 
                                </tr>
                            );
                        })}
                    </tbody>
                    </Table>
                    </div>
        );
    }else{
        return (
            <div>
                <h4>Información mercados disponibles</h4>
            <Table striped bordered size="sm">
                <thead>
                    <tr>
                    <th>Exchange</th>
                    <th>Pais</th>
                    <th>Vol Compra</th>
                    <th>Vol Venta</th>
                    <th>Vol Total</th>
                    <th>Cantidad Acciones</th>
                    <th>Participacion</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(exchange_info).map((exchange_ticker) =>{
                        
                        return (
                            <tr>
                                <td>{exchange_info[exchange_ticker]['name']}</td>
                                <td>{exchange_info[exchange_ticker]['country']}</td>
                                <td>{Intl.NumberFormat("de-DE").format(get_volumen_compraventa(exchange_info[exchange_ticker],databuy,stocks_info))}</td>
                                <td>{Intl.NumberFormat("de-DE").format(get_volumen_compraventa(exchange_info[exchange_ticker],datasell,stocks_info))}</td>
                                <td>{Intl.NumberFormat("de-DE").format(get_volumen_total(exchange_info[exchange_ticker],databuy,datasell,stocks_info))}</td>
                                <td>{get_num_empresas(exchange_info[exchange_ticker])}</td>
                                <td>{get_frac_volumen(exchange_info,exchange_ticker,databuy,datasell,stocks_info)}%</td> 
                            </tr>
                        );
                    })}
                </tbody>
                </Table>
                <h4>Información del Mercado {exchange['name']}</h4>
                <Table striped bordered size="sm">
                    <thead>
                        <tr>
                            <th>Empresa</th>
                            <th>Pais</th>
                            <th>Vol Transado</th>
                            <th>Maximo</th>
                            <th>Minimo</th>
                            <th>Ultimo Precio</th>
                            <th>Variacion Porcentual</th>
                        </tr>
                    </thead>
                    <tbody>
                        {exchange['listed_companies'].map((nombre_compania) => {
                            return (
                                <tr>
                                    
                                    <td>{nombre_compania}</td>
                                    <td>{get_pais_compania(nombre_compania,stocks_info)}</td>
                                    <td>{Intl.NumberFormat("de-DE").format(get_vol_transado(nombre_compania,stocks_info,databuy,datasell))}</td>
                                    <td>{Intl.NumberFormat("de-DE", {style: "currency", currency: get_quote_base(nombre_compania,stocks_info)}).format(max_values[get_ticker(nombre_compania,stocks_info)])}</td>
                                    <td>{Intl.NumberFormat("de-DE", {style: "currency", currency: get_quote_base(nombre_compania,stocks_info)}).format(min_values[get_ticker(nombre_compania,stocks_info)])}</td>
                                    <td>{Intl.NumberFormat("de-DE", {style: "currency", currency: get_quote_base(nombre_compania,stocks_info)}).format(last_value[get_ticker(nombre_compania,stocks_info)])}</td>
                                    <td>{variaciones[get_ticker(nombre_compania,stocks_info)]} %</td>
                                </tr>

                            )
                        })}
                    </tbody>
                </Table>

            <div className="Grafico-Grid">
            {exchange['listed_companies'].map((nombre_compania) => {
                return (<div className="Grafico">
                    <h4>{nombre_compania }</h4>
                    <LineChart width={500} height={300} data={filter_ticker(exchange_info,dataupdate,exchange_active,nombre_compania,stocks_info)}>
                    <XAxis dataKey="time"/>
                    <YAxis/>
                    <Legend verticalAlign="top" height={36}/>
                    <Line name={nombre_compania} stype="monotone" dataKey="value" stroke="#8884d8" />
                    <Tooltip />
                    </LineChart>
                </div>);

            })}
            </div> 
        </div>
        );
    }
}



const App = ({}) => {

    const [dataupdate,setData] = useState([]);
    const [databuy,setDataBuy] = useState([]);
    const [datasell,setDataSell] = useState([]);
    // const [exchange_info,setDataExchange]=useState([]);
    // const [stocks_info,setDataStocks]=useState([]);

    
    
    // Listen for update event, update state
    useEffect(() => {       
        socket.on('UPDATE',(update) => {
            var date=new Date(update.time).toLocaleDateString([],{hour:'2-digit', minute:'2-digit',second:'2-digit'});
            var datazo=update;
            datazo['time']=date;
            if (!dataupdate.length){
                setData(currentData=>[...currentData,datazo]);
                variaciones[datazo['ticker']]=(100 *(datazo['value']-last_value[datazo['ticker']])/last_value[datazo['ticker']]).toFixed(2);
                last_value[datazo['ticker']]=datazo['value'];
            }else{
                if (dataupdate[dataupdate.length-1] != datazo){
                    setData(currentData=>[...currentData,datazo]);
                    variaciones[datazo['ticker']]=(100 *(datazo['value']-last_value[datazo['ticker']])/last_value[datazo['ticker']]).toFixed(2);
                    last_value[datazo['ticker']]=datazo['value'];
                    console.log(last_value);
                }
            }
        }),
        socket.on('BUY',(value) => {
            var date=new Date(value.time).toLocaleDateString([],{hour:'2-digit', minute:'2-digit',second:'2-digit'});
            var datazo=value;
            datazo['time']=date;
            if (!databuy.length){
                setDataBuy(currentData=>[...currentData,datazo]);
            }else{
                if (databuy[databuy.length-1] != datazo){
                    setDataBuy(currentData=>[...currentData,datazo]);
                }
            }
        }),
        socket.on('SELL',(value) => {
            var date=new Date(value.time).toLocaleDateString([],{hour:'2-digit', minute:'2-digit',second:'2-digit'});
            var datazo=value;
            datazo['time']=date;
            if(!datasell.length){
                setDataSell( currentData => [...currentData,datazo]);
            }else{
                if (datasell[datasell.length-1] != datazo){
                    setDataBuy(currentData=>[...currentData,datazo]);
                }
            }
        });
    },[]);
    llenar_min_max_values(stocks_info);
    get_max_min_value(dataupdate);
    return (
        <div>  
            <NavBar exch={exchange_info} />
            {condition_exchange_active(exchange_info,dataupdate,exchange_active,stocks_info,databuy,datasell)}
        </div>
        );
};

export {socket};
export {stocks_info};
export {exchange_info};
// export App;

ReactDOM.render(<App />,document.getElementById("root"));
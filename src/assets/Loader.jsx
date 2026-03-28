import './Loader.css';

function Loader() {
    return(
        <div className="loader-cover">
            <div className='loader'>
                <div className='loader-dot'></div>
                <div className='loader-dot'></div>
            </div>
            <div className="wave"></div>
            <p>Loading . . .</p>
        </div>
    );
}

export default Loader;
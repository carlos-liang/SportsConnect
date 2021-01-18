import React, { Component } from 'react';
import { withGoogleMap, GoogleMap, withScriptjs, InfoWindow, Marker } from "react-google-maps";
import Geocode from "react-geocode";
import Geosuggest, { Suggest } from 'react-geosuggest';
import './geosuggest.css';

Geocode.setApiKey( "AIzaSyDitJQ4zcqGZdK7RIhoyEJhJVIxcIe6JNw" );
Geocode.enableDebug();

// NOTE: This is modified code, based on: 
// https://github.com/imranhsayed/google-maps-in-react 

class Map extends Component{

    constructor( props ){
		super( props );
		this.state = {
			address: this.props.value || 'Sydney, NSW Australia',
			mapPosition: {
				lat: this.props.center.lat,
				lng: this.props.center.lng
			},
			markerPosition: {
				lat: this.props.center.lat,
				lng: this.props.center.lng
			}
		}
	}

	onUpdate(){
		const text = this.state.address;
		this.props.onUpdate(this.props.name, text)
	}

	/**
	 * Gets the current address from the default map position and sets them into the state
	 */
	componentDidMount() {
		// When component mounts, update state/value of LatLng on map, using string address
		const { address } = this.state;
		Geocode.fromAddress(address).then((response) => {
			console.log('GEOCODE fromAddress called: ', response);
			const { lat, lng } = response.results[0].geometry.location;
			const position = { lat: lat, lng: lng };
			this.setState({ mapPosition: position, markerPosition: position });
		}).catch((error) => {
			console.log('Error getting cooridnates from address with fromAddress call: ', error);
		});
	};

	/**
	 * Component should only update, when the user selects the address or drags the pin
	 *
	 * @param nextProps
	 * @param nextState
	 * @return {boolean}
	 */
	shouldComponentUpdate( nextProps, nextState ){
		if ( this.state.address !== nextState.address 
			|| this.state.markerPosition.lat !== nextState.markerPosition.lat
			|| this.state.markerPosition.lng !== nextState.markerPosition.lng
		) {
			return true;
		} 
		return false;
		// return true;
	}

	/**
	 * And function for address input
	 * @param event
	 */
	onChange = ( event ) => {
		this.setState({ [event.target.name]: event.target.value });
	};
	/**
	 * This Event triggers when the marker window is closed
	 *
	 * @param event
	 */
	onInfoWindowClose = ( event ) => {

	};

	/**
	 * When the marker is dragged you get the latitude and longitude using the functions available from event object.
	 * Use geocode to get the address from the latitude and longitude positions.
	 * And then set those values in the state.
	 *
	 * @param event
	 */
	onMarkerDragEnd = ( event ) => {
		let newLat = event.latLng.lat(),
		    newLng = event.latLng.lng();

		Geocode.fromLatLng( newLat , newLng ).then(
			response => {
				const address = response.results[0].formatted_address;
				this.setState( {
					address: ( address ) ? address : '',
					markerPosition: {
						lat: newLat,
						lng: newLng
					},
					mapPosition: {
						lat: newLat,
						lng: newLng
					},
				} )
				this.onUpdate()
			},
			error => {
				console.error(error);
			}
		);
	};

	/**
	 * When the user types an address in the search box
	 * @param place
	 */
	onSuggestSelect = ( place ) => {
		console.log( 'plc', place );
		if (!place) {
			console.log('place not defined??');
			return;
		}
		const address = place.label,
          latValue = place.location.lat,
          lngValue = place.location.lng;
		// Set these values in the state.
		this.setState({
			address: ( address ) ? address : '',
			markerPosition: {
				lat: latValue,
				lng: lngValue
			},
			mapPosition: {
				lat: latValue,
				lng: lngValue
			}
		});
		this.onUpdate();
	};


	render(){
		const AsyncMap = withScriptjs(
			withGoogleMap(
				props => (
					<GoogleMap google={ this.props.google }
					           defaultZoom={ this.props.zoom }
					           defaultCenter={{ lat: this.state.mapPosition.lat, lng: this.state.mapPosition.lng }}
					>
						{/* InfoWindow on top of marker */}
						<InfoWindow
							onClose={this.onInfoWindowClose}
							position={{ lat: ( this.state.markerPosition.lat + 0.0018 ), lng: this.state.markerPosition.lng }}
						>
							<div>
								<span style={{ padding: 0, margin: 0 }}>{ this.state.address }</span>
							</div>
						</InfoWindow>
						{/*Marker*/}
						<Marker google={this.props.google}
						        name={'Dolores park'}
						        draggable={true}
						        onDragEnd={ this.onMarkerDragEnd }
								position={{ lat: this.state.markerPosition.lat, lng: this.state.markerPosition.lng }}
						/>
						<Marker />
						{/* For Auto complete Search Box */}
            <Geosuggest
			  placeholder="Location"
			  initialValue={this.props.value}
			  label='location'
              onSuggestSelect={this.onSuggestSelect}
            />
					</GoogleMap>
				)
			)
		);
		let map;
		if( this.props.center.lat !== undefined ) {
			map = <div>
				

				<AsyncMap
					googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyDitJQ4zcqGZdK7RIhoyEJhJVIxcIe6JNw&libraries=places"
					loadingElement={
						<div style={{ height: this.props.height }} />
					}
					containerElement={
						<div style={{ height: this.props.height }} />
					}
					mapElement={
						<div style={{ height: this.props.height }} />
					}
				/>
			</div>
		} else {
			map = <div style={{height: this.props.height}} />
		}
		return( map )
	}
}
export default Map

			// 	<div>
			// 		<div className="form-group" >
            // <input style={{ padding: '10px', height: '25px', width: '95%', marginBottom: '10px' }} type="text" name="address" className="form-control" onChange={ this.onChange } readOnly="readOnly" value={ this.state.address }/>
			// 		</div>
			// 	</div>